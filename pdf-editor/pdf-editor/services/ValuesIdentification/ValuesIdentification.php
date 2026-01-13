<?php
declare(strict_types=1);

$valuesIdentificationRoot = dirname(__DIR__, 2);
if (!defined('VALUES_IDENTIFICATION_DEFINITIONS_ONLY')) {
    define('VALUES_IDENTIFICATION_DEFINITIONS_ONLY', true);
}

$valuesIdentificationInitialLevel = function_exists('ob_get_level') ? ob_get_level() : 0;
if (function_exists('ob_start')) {
    ob_start();
}

require_once $valuesIdentificationRoot . DIRECTORY_SEPARATOR . 'index.php';

if (function_exists('ob_get_level') && function_exists('ob_end_clean')) {
    while (ob_get_level() > $valuesIdentificationInitialLevel) {
        ob_end_clean();
    }
}

/**
 * Service centralisé d'identification et de cartographie des valeurs.
 *
 * Ce module analyse la définition du formulaire (questions, options, sections)
 * ainsi que les données réelles (request.json) pour générer une cartographie
 * exploitable par les autres services (dont le pdf-editor).
 */
class ValuesIdentificationService
{
    private string $rootDir;
    private string $serviceDir;
    private string $elementsDir;
    private bool $definitionsBootstrapped = false;

    /** @var array<string, mixed> */
    private array $fieldDefinitions = [];
    /** @var array<string, string> */
    private array $questionMapping = [];
    /** @var array<string, array<int, string>> */
    private array $sectionFlow = [];

    /**
     * Catalogue des champs (clé canonique => métadonnées).
     *
     * @var array{
     *     entries: array<string, array<string, mixed>>,
     *     questions: array<int, array<string, mixed>>,
     *     responses: array<string, array<string, mixed>>
     * }
     */
    private array $fieldCatalogue = [
        'entries' => [],
        'questions' => [],
        'responses' => [],
    ];

    /** @var array<string, array{occurrences:int, values:array<string,int>, type:string, parent:?string}> */
    private array $usage = [];

    /** @var array<string, array{count:int, values:array<string,int>}> */
    private array $unknownRequestFields = [];

    /** @var array<int, string> */
    private array $requestFiles = [];

    public function __construct(?string $rootDir = null)
    {
        $this->serviceDir = __DIR__;
        $this->rootDir = $rootDir !== null ? rtrim($rootDir, DIRECTORY_SEPARATOR) : dirname(__DIR__, 2);
        $this->elementsDir = $this->serviceDir . DIRECTORY_SEPARATOR . 'elements';
    }

    /**
     * Exécute l'analyse complète.
     *
     * @param bool $writeToDisk Génère (ou non) les fichiers d'aide-mémoire.
     * @return array<string, mixed>
     */
    public function run(bool $writeToDisk = true): array
    {
        $this->bootstrapDefinitions();
        $this->loadFormDefinitionData();
        $this->buildFieldCatalogue();
        $this->scanRequestData();

        $dataset = $this->buildDataset();
        if ($writeToDisk) {
            $this->writeElementFiles($dataset);
        }

        return $dataset;
    }

    /**
     * Charge les définitions du formulaire sans exécuter le contrôleur principal.
     */
    private function bootstrapDefinitions(): void
    {
        if ($this->definitionsBootstrapped) {
            return;
        }

        if (!function_exists('getFieldDefinitions')) {
            throw new RuntimeException('La fonction getFieldDefinitions() est introuvable.');
        }

        $this->definitionsBootstrapped = true;
    }

    /**
     * Récupère les fonctions de définition du formulaire.
     */
    private function loadFormDefinitionData(): void
    {
        if (!function_exists('getFieldDefinitions')) {
            throw new RuntimeException('La fonction getFieldDefinitions() est introuvable.');
        }

        $this->fieldDefinitions = getFieldDefinitions();
        $this->questionMapping = function_exists('getQuestionMapping') ? getQuestionMapping() : [];
        $this->sectionFlow = function_exists('getFormSectionFlow') ? getFormSectionFlow() : [];
    }

    /**
     * Construit le catalogue interne des champs/questions/options.
     */
    private function buildFieldCatalogue(): void
    {
        $fieldToSection = $this->buildFieldToSectionMap();
        $entries = [];
        $questions = [];
        $responses = [];

        foreach ($this->getOrderedFieldSequence($fieldToSection) as $item) {
            $fieldKey = $item['fieldKey'];
            $definition = $item['definition'];
            $parent = $item['parent'];
            $section = $item['section'];

            $entry = $this->createFieldEntry($fieldKey, $definition, $parent, $section);
            $entries[$entry['key']] = $entry;
            $questions[] = [
                'label' => $entry['label'],
                'key' => $entry['key'],
                'section' => $entry['section'],
                'type' => $entry['type'],
                'origin' => $entry['origin'],
            ];
            $this->collectResponseOptions($responses, $entry, $definition);
        }

        $this->fieldCatalogue = [
            'entries' => $entries,
            'questions' => $questions,
            'responses' => $responses,
        ];
    }

    /**
     * Détermine l'ordre canonique des champs en suivant le flux du formulaire.
     *
     * @param array<string, string> $fieldToSection
     * @return array<int, array{fieldKey:string, definition:array<mixed>, parent:?string, section:?string}>
     */
    private function getOrderedFieldSequence(array $fieldToSection): array
    {
        $sequence = [];
        $handled = [];

        foreach ($this->sectionFlow as $section => $fields) {
            foreach ($fields as $fieldKey) {
                if (!isset($this->fieldDefinitions[$fieldKey])) {
                    continue;
                }

                $definition = $this->fieldDefinitions[$fieldKey];
                $sequence[] = [
                    'fieldKey' => $fieldKey,
                    'definition' => $definition,
                    'parent' => null,
                    'section' => $section,
                ];
                $handled[$fieldKey] = true;

                if (($definition['type'] ?? null) === 'repeatable') {
                    foreach (($definition['subfields'] ?? []) as $subKey => $subDefinition) {
                        $sequence[] = [
                            'fieldKey' => $subKey,
                            'definition' => $subDefinition,
                            'parent' => $fieldKey,
                            'section' => $section,
                        ];
                    }
                }
            }
        }

        foreach ($this->fieldDefinitions as $fieldKey => $definition) {
            if (isset($handled[$fieldKey])) {
                continue;
            }

            $section = $fieldToSection[$fieldKey] ?? null;
            $sequence[] = [
                'fieldKey' => $fieldKey,
                'definition' => $definition,
                'parent' => null,
                'section' => $section,
            ];

            if (($definition['type'] ?? null) === 'repeatable') {
                foreach (($definition['subfields'] ?? []) as $subKey => $subDefinition) {
                    $sequence[] = [
                        'fieldKey' => $subKey,
                        'definition' => $subDefinition,
                        'parent' => $fieldKey,
                        'section' => $section,
                    ];
                }
            }
        }

        return $sequence;
    }

    /**
     * Construit la table de correspondance champ -> section.
     *
     * @return array<string, string>
     */
    private function buildFieldToSectionMap(): array
    {
        $map = [];
        foreach ($this->sectionFlow as $section => $fields) {
            foreach ($fields as $field) {
                $map[$field] = $section;
            }
        }
        return $map;
    }

    /**
     * Crée l'entrée de catalogue pour un champ donné.
     *
     * @param string      $fieldKey  Clé du champ (dans la définition).
     * @param array<mixed> $definition Définition du champ.
     * @param string|null $parentKey Clé parente pour les répétables.
     * @param string|null $section   Section du formulaire.
     *
     * @return array<string, mixed>
     */
    private function createFieldEntry(string $fieldKey, array $definition, ?string $parentKey, ?string $section): array
    {
        $canonicalKey = $parentKey ? $parentKey . '.' . $fieldKey : $fieldKey;
        $label = $this->questionMapping[$fieldKey] ?? ($definition['label'] ?? $canonicalKey);
        if ($parentKey !== null) {
            $label = $definition['label'] ?? $label;
        }

        return [
            'key' => $canonicalKey,
            'field' => $fieldKey,
            'parent' => $parentKey,
            'label' => $label,
            'type' => (string)($definition['type'] ?? 'text'),
            'section' => $section,
            'origin' => 'index.php:getFieldDefinitions:' . $canonicalKey,
            'definition' => $definition,
        ];
    }

    /**
     * Ajoute les options de réponse (définies dans la configuration) au catalogue.
     *
     * @param array<string, array<string, mixed>> $responses
     * @param array<string, mixed>                $entry
     * @param array<mixed>                        $definition
     */
    private function collectResponseOptions(array &$responses, array $entry, array $definition): void
    {
        $key = $entry['key'];
        if (!isset($responses[$key])) {
            $responses[$key] = [
                'field' => $key,
                'label' => $entry['label'],
                'type' => $entry['type'],
                'section' => $entry['section'],
                'origin' => $entry['origin'],
                'options' => [],
            ];
        }

        if (isset($definition['options']) && is_array($definition['options'])) {
            foreach ($definition['options'] as $value => $label) {
                $valueKey = is_int($value) ? (string)$value : (string)$value;
                $responses[$key]['options'][$valueKey] = [
                    'value' => $valueKey,
                    'label' => (string)$label,
                    'defined' => true,
                ];
            }
        }

        $type = $definition['type'] ?? null;
        if ($type === 'checkbox') {
            if (isset($definition['checked_value'])) {
                $checked = (string)$definition['checked_value'];
                $responses[$key]['options'][$checked] = [
                    'value' => $checked,
                    'label' => $definition['checked_label'] ?? 'Valeur cochée',
                    'defined' => true,
                ];
            }
            if (isset($definition['unchecked_value'])) {
                $unchecked = (string)$definition['unchecked_value'];
                $responses[$key]['options'][$unchecked] = [
                    'value' => $unchecked,
                    'label' => $definition['unchecked_label'] ?? 'Valeur décochée',
                    'defined' => true,
                ];
            }
        }
    }

    /**
     * Analyse les request.json existants pour cartographier l'usage réel.
     */
    private function scanRequestData(): void
    {
        $requestsDir = $this->rootDir . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'requests';
        if (!is_dir($requestsDir)) {
            return;
        }

        $directoryIterator = new DirectoryIterator($requestsDir);
        foreach ($directoryIterator as $fileInfo) {
            if ($fileInfo->isDot() || !$fileInfo->isDir()) {
                continue;
            }

            $folder = $fileInfo->getPathname();
            $requestJson = $folder . DIRECTORY_SEPARATOR . 'request.json';
            if (!is_file($requestJson)) {
                continue;
            }

            $this->requestFiles[] = $requestJson;
            $content = file_get_contents($requestJson);
            if ($content === false) {
                continue;
            }

            $decoded = json_decode($content, true);
            if (!is_array($decoded)) {
                continue;
            }

            $formData = $decoded['formData'] ?? [];
            if (!is_array($formData)) {
                continue;
            }

            foreach ($formData as $fieldKey => $value) {
                if (isset($this->fieldDefinitions[$fieldKey])) {
                    $definition = $this->fieldDefinitions[$fieldKey];
                    if (($definition['type'] ?? null) === 'repeatable' && is_array($value)) {
                        foreach ($value as $item) {
                            if (!is_array($item)) {
                                continue;
                            }
                            $subfields = $definition['subfields'] ?? [];
                            foreach ($subfields as $subKey => $subDefinition) {
                                $canonicalKey = $fieldKey . '.' . $subKey;
                                $subValue = $item[$subKey] ?? null;
                                $this->accumulateValueUsage($canonicalKey, $subValue, $subDefinition, $fieldKey);
                            }
                        }
                    } else {
                        $this->accumulateValueUsage($fieldKey, $value, $definition, null);
                    }
                } else {
                    $valueList = $this->normalizeValueForUsage($value, ['type' => 'text']);
                    if (!isset($this->unknownRequestFields[$fieldKey])) {
                        $this->unknownRequestFields[$fieldKey] = ['count' => 0, 'values' => []];
                    }
                    $this->unknownRequestFields[$fieldKey]['count']++;
                    foreach ($valueList as $normalized) {
                        if (!isset($this->unknownRequestFields[$fieldKey]['values'][$normalized])) {
                            $this->unknownRequestFields[$fieldKey]['values'][$normalized] = 0;
                        }
                        $this->unknownRequestFields[$fieldKey]['values'][$normalized]++;
                    }
                }
            }
        }
    }

    /**
     * Ajoute l'usage observé à la structure interne.
     *
     * @param string       $key
     * @param mixed        $value
     * @param array<mixed> $definition
     * @param string|null  $parentKey
     */
    private function accumulateValueUsage(string $key, $value, array $definition, ?string $parentKey): void
    {
        $normalizedValues = $this->normalizeValueForUsage($value, $definition);
        if (!isset($this->usage[$key])) {
            $this->usage[$key] = [
                'occurrences' => 0,
                'values' => [],
                'type' => (string)($definition['type'] ?? 'text'),
                'parent' => $parentKey,
            ];
        }

        $this->usage[$key]['occurrences']++;
        foreach ($normalizedValues as $normalized) {
            if (!isset($this->usage[$key]['values'][$normalized])) {
                $this->usage[$key]['values'][$normalized] = 0;
            }
            $this->usage[$key]['values'][$normalized]++;
        }
    }

    /**
     * Normalise les valeurs observées en chaînes exploitables.
     *
     * @param mixed        $value
     * @param array<mixed> $definition
     *
     * @return array<int, string>
     */
    private function normalizeValueForUsage($value, array $definition): array
    {
        if ($value === null) {
            return [''];
        }

        $type = $definition['type'] ?? null;
        if ($type === 'checkboxes' && is_array($value)) {
            return array_map(static fn($item) => is_scalar($item) ? (string)$item : json_encode($item, JSON_UNESCAPED_UNICODE), $value);
        }

        if (is_array($value)) {
            $normalized = [];
            foreach ($value as $item) {
                if (is_scalar($item) || $item === null) {
                    $normalized[] = (string)$item;
                } else {
                    $normalized[] = json_encode($item, JSON_UNESCAPED_UNICODE);
                }
            }
            return $normalized === [] ? [''] : $normalized;
        }

        if (is_bool($value)) {
            return [$value ? 'true' : 'false'];
        }

        if (is_scalar($value)) {
            return [(string)$value];
        }

        return [json_encode($value, JSON_UNESCAPED_UNICODE) ?: ''];
    }

    /**
     * Construit le jeu de données final.
     *
     * @return array<string, mixed>
     */
    private function buildDataset(): array
    {
        $responses = $this->fieldCatalogue['responses'];
        $this->injectUsageIntoResponses($responses);

        return [
            'generated_at' => (new DateTimeImmutable())->format(DATE_ATOM),
            'root_dir' => $this->rootDir,
            'fields' => $this->fieldCatalogue['entries'],
            'questions' => $this->fieldCatalogue['questions'],
            'responses' => $responses,
            'usage' => [
                'fields' => $this->usage,
                'unknown' => $this->unknownRequestFields,
                'sources' => $this->requestFiles,
            ],
        ];
    }

    /**
     * Ajoute les valeurs observées dans les réponses disponibles.
     *
     * @param array<string, array<string, mixed>> $responses
     */
    private function injectUsageIntoResponses(array &$responses): void
    {
        foreach ($this->usage as $fieldKey => $usage) {
            if (!isset($responses[$fieldKey])) {
                $entry = $this->fieldCatalogue['entries'][$fieldKey] ?? null;
                $responses[$fieldKey] = [
                    'field' => $fieldKey,
                    'label' => $entry['label'] ?? $fieldKey,
                    'type' => $entry['type'] ?? 'text',
                    'section' => $entry['section'] ?? null,
                    'origin' => $entry['origin'] ?? 'request.json',
                    'options' => [],
                ];
            }

            foreach ($usage['values'] as $value => $count) {
                if (!isset($responses[$fieldKey]['options'][$value])) {
                    $responses[$fieldKey]['options'][$value] = [
                        'value' => $value,
                        'label' => $value,
                        'defined' => false,
                        'observed' => $count,
                    ];
                } else {
                    $responses[$fieldKey]['options'][$value]['observed'] = $count;
                }

                if (($responses[$fieldKey]['options'][$value]['defined'] ?? true) === false) {
                    $responses[$fieldKey]['observed_only_total'] = ($responses[$fieldKey]['observed_only_total'] ?? 0) + $count;
                }
            }

            $responses[$fieldKey]['observations'] = $usage['occurrences'];
        }
    }

    /**
     * Génère les fichiers d'aide-mémoire.
     *
     * @param array<string, mixed> $dataset
     */
    private function writeElementFiles(array $dataset): void
    {
        $this->ensureElementsDir();

        $generatedAt = $dataset['generated_at'] ?? date(DATE_ATOM);
        /** @var array<string, array<string, mixed>> $fields */
        $fields = $dataset['fields'];
        /** @var array<int, array<string, mixed>> $questions */
        $questions = $dataset['questions'];
        /** @var array<string, array<string, mixed>> $responses */
        $responses = $dataset['responses'];
        /** @var array<string, array{occurrences:int, values:array<string,int>}> $usage */
        $usage = $dataset['usage']['fields'] ?? [];
        /** @var array<string, array{count:int, values:array<string,int>}> $unknown */
        $unknown = $dataset['usage']['unknown'] ?? [];

        $this->writeValuesFile($generatedAt, $fields, $usage, $unknown);
        $this->writeValuesMeaningFile($generatedAt, $fields, $usage, $unknown);
        $this->writeQuestionsFile($generatedAt, $questions);
        $this->writeQuestionsMeaningFile($generatedAt, $fields);
        $this->writeResponsesFile($generatedAt, $responses);
        $this->writeResponsesMeaningFile($generatedAt, $responses);
    }

    private function ensureElementsDir(): void
    {
        if (!is_dir($this->elementsDir)) {
            mkdir($this->elementsDir, 0775, true);
        }

        $htaccessPath = $this->elementsDir . DIRECTORY_SEPARATOR . '.htaccess';
        if (!is_file($htaccessPath)) {
            $rules = "Options -Indexes\n"
                . "<IfModule mod_authz_core.c>\n"
                . "    Require all denied\n"
                . "</IfModule>\n"
                . "<IfModule !mod_authz_core.c>\n"
                . "    Deny from all\n"
                . "</IfModule>\n";
            file_put_contents($htaccessPath, $rules);
        }
    }

    /**
     * @param string                                                $generatedAt
     * @param array<string, array<string, mixed>>                    $fields
     * @param array<string, array{occurrences:int, values:array<string,int>}> $usage
     * @param array<string, array{count:int, values:array<string,int>}>       $unknown
     */
    private function writeValuesFile(string $generatedAt, array $fields, array $usage, array $unknown): void
    {
        $lines = [];
        $lines[] = '# Liste des valeurs internes générée le ' . $generatedAt;
        $lines[] = '# Format: champ [métadonnées]';
        foreach ($fields as $key => $entry) {
            $meta = [];
            if (!empty($entry['section'])) {
                $meta[] = 'section=' . $entry['section'];
            }
            if (!empty($entry['type'])) {
                $meta[] = 'type=' . $entry['type'];
            }
            if (!empty($entry['parent'])) {
                $meta[] = 'parent=' . $entry['parent'];
            }
            if (!empty($usage[$key]['occurrences'])) {
                $meta[] = 'observations=' . $usage[$key]['occurrences'];
            }
            $lines[] = $key . (empty($meta) ? '' : ' [' . implode('; ', $meta) . ']');
        }

        if ($unknown) {
            $lines[] = '';
            $lines[] = '# Champs observés dans les requêtes mais non définis:';
            foreach ($unknown as $fieldKey => $info) {
                $lines[] = sprintf('# %s (occurrences=%d)', $fieldKey, $info['count']);
            }
        }

        $this->writeLinesToFile('values.txt', $lines);
    }

    /**
     * @param string                                                $generatedAt
     * @param array<string, array<string, mixed>>                    $fields
     * @param array<string, array{occurrences:int, values:array<string,int>}> $usage
     * @param array<string, array{count:int, values:array<string,int>}>       $unknown
     */
    private function writeValuesMeaningFile(string $generatedAt, array $fields, array $usage, array $unknown): void
    {
        $lines = [];
        $lines[] = '# Cartographie détaillée des valeurs générée le ' . $generatedAt;
        $lines[] = '# Champ | Libellé | Type | Section | Origine | Observations';
        foreach ($fields as $key => $entry) {
            $lines[] = implode(' | ', [
                $key,
                $entry['label'],
                $entry['type'],
                $entry['section'] ?? '-',
                $entry['origin'],
                (string)($usage[$key]['occurrences'] ?? 0),
            ]);
        }

        if ($unknown) {
            $lines[] = '';
            $lines[] = '# Champs non définis mais observés:';
            foreach ($unknown as $fieldKey => $info) {
                $sample = implode(', ', array_slice(array_keys($info['values']), 0, 5));
                $lines[] = sprintf('# %s | occurrences=%d | exemples=%s', $fieldKey, $info['count'], $sample);
            }
        }

        $this->writeLinesToFile('values-meaning.txt', $lines);
    }

    /**
     * @param string                                $generatedAt
     * @param array<int, array<string, mixed>>       $questions
     */
    private function writeQuestionsFile(string $generatedAt, array $questions): void
    {
        $lines = [];
        $lines[] = '# Questions du formulaire générées le ' . $generatedAt;
        foreach ($questions as $question) {
            $label = $question['label'] ?? '';
            $fieldKey = $question['key'] ?? '';
            $lines[] = $label . ' [' . $fieldKey . ']';
        }

        $this->writeLinesToFile('questions.txt', $lines);
    }

    /**
     * @param string                                                $generatedAt
     * @param array<string, array<string, mixed>>                    $fields
     */
    private function writeQuestionsMeaningFile(string $generatedAt, array $fields): void
    {
        $lines = [];
        $lines[] = '# Cartographie des questions générée le ' . $generatedAt;
        $lines[] = '# Question | Champ | Section | Type | Origine';
        foreach ($fields as $entry) {
            $lines[] = implode(' | ', [
                $entry['label'],
                $entry['key'],
                $entry['section'] ?? '-',
                $entry['type'],
                $entry['origin'],
            ]);
        }

        $this->writeLinesToFile('questions-meaning.txt', $lines);
    }

    /**
     * @param string                                                $generatedAt
     * @param array<string, array<string, mixed>>                    $responses
     */
    private function writeResponsesFile(string $generatedAt, array $responses): void
    {
        $lines = [];
        $lines[] = '# Réponses possibles générées le ' . $generatedAt;
        foreach ($responses as $fieldKey => $info) {
            $lines[] = '';
            $lines[] = sprintf('[%s] %s', $fieldKey, $info['label']);
            if (!empty($info['options'])) {
                $hasDefined = false;
                $observedOutside = 0;

                foreach ($info['options'] as $option) {
                    $isDefined = ($option['defined'] ?? true) === true;
                    if ($isDefined) {
                        $hasDefined = true;
                        $meta = [];
                        if (isset($option['observed'])) {
                            $meta[] = 'utilisation=' . $option['observed'];
                        }
                        $lines[] = sprintf('  - %s => %s%s', $option['value'], $option['label'], $meta ? ' [' . implode('; ', $meta) . ']' : '');
                    } else {
                        $observedOutside += (int)($option['observed'] ?? 0);
                    }
                }

                if (!$hasDefined) {
                    $note = '  (Aucune option prédéfinie';
                    if ($observedOutside > 0) {
                        $note .= '; ' . $observedOutside . ' réponses observées';
                    }
                    $lines[] = $note . ')';
                } elseif ($observedOutside > 0) {
                    $lines[] = sprintf('  # %d réponses hors configuration observées', $observedOutside);
                }
            } else {
                $observedOutside = (int)($info['observed_only_total'] ?? 0);
                $lines[] = $observedOutside > 0
                    ? sprintf('  (Aucune option prédéfinie; %d réponses observées)', $observedOutside)
                    : '  (Aucune option prédéfinie)';
            }
        }

        $this->writeLinesToFile('responses.txt', $lines);
    }

    /**
     * @param string                                                $generatedAt
     * @param array<string, array<string, mixed>>                    $responses
     */
    private function writeResponsesMeaningFile(string $generatedAt, array $responses): void
    {
        $lines = [];
        $lines[] = '# Cartographie complète des réponses générée le ' . $generatedAt;
        $lines[] = '# Champ | Valeur | Libellé | Définie | Observée | Section | Origine';
        foreach ($responses as $fieldKey => $info) {
            $options = $info['options'] ?? [];
            if (!$options) {
                $lines[] = implode(' | ', [
                    $fieldKey,
                    '(aucune)',
                    '',
                    'non',
                    '0',
                    $info['section'] ?? '-',
                    $info['origin'],
                ]);
                continue;
            }

            foreach ($options as $option) {
                $lines[] = implode(' | ', [
                    $fieldKey,
                    $option['value'],
                    $option['label'],
                    ($option['defined'] ?? true) ? 'oui' : 'non',
                    (string)($option['observed'] ?? 0),
                    $info['section'] ?? '-',
                    $info['origin'],
                ]);
            }
        }

        $this->writeLinesToFile('responses-meaning.txt', $lines);
    }

    private function writeLinesToFile(string $filename, array $lines): void
    {
        $path = $this->elementsDir . DIRECTORY_SEPARATOR . $filename;
        $content = implode(PHP_EOL, $lines) . PHP_EOL;
        file_put_contents($path, $content);
    }
}

if (PHP_SAPI === 'cli' && realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    $service = new ValuesIdentificationService();
    $dataset = $service->run(true);
    $countFields = count($dataset['fields'] ?? []);
    fwrite(STDOUT, sprintf("ValuesIdentification: %d champs analysés.\n", $countFields));
    fwrite(STDOUT, sprintf("Fichiers générés dans %s\n", realpath($serviceDir = __DIR__ . '/elements') ?: ($serviceDir ?? 'elements')));
}