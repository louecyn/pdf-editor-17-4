<?php
declare(strict_types=1);

/**
 * Prépare les tableaux de correspondances pour les chemins request.json,
 * fused et admin à partir du jeu de données ValuesIdentification.
 *
 * @param array<string, mixed> $dataset
 * @return array{
 *     requestPaths: array<string, array{key:string,label:string,section:?string,path:string,note:string,examples:array<int,string>}>,
 *     fusedPaths: array<int, array{key:string,label:string,request_path:string,file_path:string,note:string}>,
 *     adminPaths: array<int, array{key:string,label:string,request_path:string,file_path:string,note:string}>
 * }
 */
function valuesIdentificationBuildPathGuides(array $dataset): array
{
    $fields = $dataset['fields'] ?? [];
    $rootDir = isset($dataset['root_dir']) && is_string($dataset['root_dir'])
        ? $dataset['root_dir']
        : dirname(__DIR__, 2);

    $requestPaths = [];
    foreach ($fields as $entry) {
        if (!is_array($entry)) {
            continue;
        }

        $key = isset($entry['key']) ? (string) $entry['key'] : '';
        if ($key === '') {
            continue;
        }

        $path = 'formData.' . $key;
        $note = '';

        if (!empty($entry['parent']) && isset($entry['field'])) {
            $parentKey = (string) $entry['parent'];
            $fieldKey = (string) $entry['field'];
            $path = sprintf('formData.%s.[index].%s', $parentKey, $fieldKey);
            $note = 'Remplacez [index] par la position (0 pour la première entrée) de l’élément répété.';
        } elseif (($entry['type'] ?? '') === 'repeatable') {
            $note = sprintf('Tableau répétable. Utilisez %s.[index] pour cibler une entrée précise.', $path);
        }

        $requestPaths[$key] = [
            'key' => $key,
            'label' => (string) ($entry['label'] ?? $key),
            'section' => $entry['section'] ?? null,
            'path' => $path,
            'note' => $note,
            'examples' => [],
        ];
    }

    $usageFields = $dataset['usage']['fields'] ?? [];
    if (is_array($usageFields)) {
        foreach ($usageFields as $usageKey => $usageInfo) {
            if (!is_string($usageKey) || $usageKey === '') {
                continue;
            }

            $examples = [];
            if (isset($usageInfo['values']) && is_array($usageInfo['values'])) {
                foreach ($usageInfo['values'] as $value => $_count) {
                    if (is_string($value) || is_numeric($value)) {
                        $examples[] = trim((string) $value);
                    }
                    if (count($examples) >= 3) {
                        break;
                    }
                }
            }

            if (!isset($requestPaths[$usageKey])) {
                $requestPaths[$usageKey] = [
                    'key' => $usageKey,
                    'label' => $usageKey,
                    'section' => $usageInfo['section'] ?? null,
                    'path' => 'formData.' . $usageKey,
                    'note' => 'Chemin observé automatiquement dans request.json.',
                    'examples' => [],
                ];
            }

            if ($usageKey === 'email') {
                $examples = ['janedoe@gmail.com'];
            }

            if ($examples !== []) {
                $requestPaths[$usageKey]['examples'] = array_slice($examples, 0, 3);
            }
        }
    }

    uasort($requestPaths, static function (array $a, array $b): int {
        return strcmp($a['key'], $b['key']);
    });

    $definitionsPath = $rootDir . DIRECTORY_SEPARATOR . 'data'
        . DIRECTORY_SEPARATOR . 'variables'
        . DIRECTORY_SEPARATOR . 'definitions.json';

    $definitionGroups = [];
    if (is_file($definitionsPath)) {
        $definitionsContents = file_get_contents($definitionsPath);
        if ($definitionsContents !== false) {
            $decodedDefinitions = json_decode($definitionsContents, true);
            if (
                is_array($decodedDefinitions)
                && isset($decodedDefinitions['groups'])
                && is_array($decodedDefinitions['groups'])
            ) {
                $definitionGroups = $decodedDefinitions['groups'];
            }
        }
    }

    $fusedPaths = [];
    $adminPaths = [];

    foreach ($definitionGroups as $group) {
        if (!is_array($group)) {
            continue;
        }

        $groupId = strtolower((string) ($group['id'] ?? ''));
        $fieldsInGroup = $group['fields'] ?? [];
        if (!is_array($fieldsInGroup)) {
            continue;
        }

        foreach ($fieldsInGroup as $fieldDefinition) {
            if (!is_array($fieldDefinition)) {
                continue;
            }

            $fieldKey = isset($fieldDefinition['key']) ? (string) $fieldDefinition['key'] : '';
            if ($fieldKey === '') {
                continue;
            }

            $label = (string) ($fieldDefinition['label'] ?? $fieldKey);

            if ($groupId === 'fused') {
                $fusedPaths[] = [
                    'key' => $fieldKey,
                    'label' => $label,
                    'request_path' => 'variables.' . $fieldKey,
                    'file_path' => 'Dossier général/FusedCustomersFile_request.json.' . $fieldKey,
                    'note' => 'Ces valeurs sont copiées dans request.json → variables lors de la synchronisation du dossier général.',
                ];
            } elseif ($groupId === 'admin') {
                $adminPaths[] = [
                    'key' => $fieldKey,
                    'label' => $label,
                    'request_path' => 'adminProfile.' . $fieldKey,
                    'file_path' => 'data/admin_profile.json → ' . $fieldKey,
                    'note' => 'Profil interne. Les sélections automatiques n’analysent pas encore ce fichier sans développement additionnel.',
                ];
            }
        }
    }

    usort($fusedPaths, static function (array $a, array $b): int {
        return strcmp($a['key'], $b['key']);
    });

    usort($adminPaths, static function (array $a, array $b): int {
        return strcmp($a['key'], $b['key']);
    });

    return [
        'requestPaths' => $requestPaths,
        'fusedPaths' => $fusedPaths,
        'adminPaths' => $adminPaths,
    ];
}