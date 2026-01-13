<?php
declare(strict_types=1);

namespace DemandeEnLigne\PdfEditor;

final class QuestionActionRepository
{
    private string $filePath;

    public function __construct(string $baseDir)
    {
        $directory = rtrim($baseDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'questions';
        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            throw new \RuntimeException('Impossible de préparer le répertoire des classes de questions.');
        }
        $this->filePath = $directory . DIRECTORY_SEPARATOR . 'question_classes.json';
        if (!is_file($this->filePath)) {
            $this->persistData([
                'classes' => [],
            ]);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listClasses(): array
    {
        $data = $this->loadData();
        $classes = [];
        foreach (($data['classes'] ?? []) as $entry) {
            $normalized = $this->sanitizeClass($entry, false);
            if ($normalized !== null) {
                $classes[] = $normalized;
            }
        }
        usort($classes, static fn(array $a, array $b): int => strcasecmp($a['title'], $b['title']));
        return $classes;
    }

    /**
     * @param array<string, mixed> $input
     * @return array<string, mixed>
     */
    public function saveClass(array $input): array
    {
        $data = $this->loadData();
        $classes = $data['classes'] ?? [];

        $incomingId = isset($input['id']) ? trim((string) $input['id']) : '';
        $existingIndex = null;
        if ($incomingId !== '') {
            foreach ($classes as $index => $item) {
                if (($item['id'] ?? '') === $incomingId) {
                    $existingIndex = $index;
                    break;
                }
            }
        }

        $targetId = $existingIndex !== null ? ($classes[$existingIndex]['id'] ?? '') : '';
        if ($targetId === '') {
            $targetId = $this->generateId();
        }
        $input['id'] = $targetId;

        $incomingCode = isset($input['code']) ? trim((string) $input['code']) : '';
        if ($incomingCode === '') {
            $existingCodes = [];
            foreach ($classes as $index => $item) {
                if ($existingIndex !== null && $index === $existingIndex) {
                    continue;
                }
                $existingCodes[] = $this->sanitizeCode($item['code'] ?? '');
            }
            $input['code'] = $this->generateClassCode($existingCodes);
        }

        $normalized = $this->sanitizeClass($input, true);
        if ($normalized === null) {
            throw new \RuntimeException('Classe de questions invalide.');
        }

        foreach ($classes as $index => $item) {
            if ($index === $existingIndex) {
                continue;
            }
            $code = $this->sanitizeCode($item['code'] ?? '');
            if ($code !== '' && $code === $normalized['code']) {
                throw new \RuntimeException('Ce code de classe est déjà utilisé par une autre classe.');
            }
        }

        if ($existingIndex !== null) {
            $classes[$existingIndex] = $normalized;
        } else {
            $classes[] = $normalized;
        }

        $data['classes'] = array_values($classes);
        $this->persistData($data);

        return $this->sanitizeClass($normalized, false) ?? $normalized;
    }

    public function deleteClass(string $id): void
    {
        $safeId = $this->sanitizeId($id);
        $data = $this->loadData();
        $classes = $data['classes'] ?? [];
        $updated = [];
        foreach ($classes as $item) {
            if (($item['id'] ?? '') === $safeId) {
                continue;
            }
            $normalized = $this->sanitizeClass($item, true);
            if ($normalized !== null) {
                $updated[] = $normalized;
            }
        }
        $data['classes'] = array_values($updated);
        $this->persistData($data);
    }

    /**
     * @return array<string, mixed>
     */
    private function loadData(): array
    {
        if (!is_file($this->filePath)) {
            return ['classes' => []];
        }
        $contents = file_get_contents($this->filePath);
        if ($contents === false || $contents === '') {
            return ['classes' => []];
        }
        $decoded = json_decode($contents, true);
        return is_array($decoded) ? $decoded : ['classes' => []];
    }

    /**
     * @param array<string, mixed> $data
     */
    private function persistData(array $data): void
    {
        $encoded = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        if ($encoded === false) {
            throw new \RuntimeException('Impossible d\'encoder les classes de questions.');
        }
        if (file_put_contents($this->filePath, $encoded) === false) {
            throw new \RuntimeException('Impossible d\'enregistrer les classes de questions.');
        }
    }

    private function generateId(): string
    {
        return 'qa_' . bin2hex(random_bytes(5));
    }

    private function generateQuestionId(): string
    {
        return 'qq_' . bin2hex(random_bytes(5));
    }

    /**
     * @param array<int, string> $existingCodes
     */
    private function generateQuestionCode(array $existingCodes = []): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $normalized = [];
        foreach ($existingCodes as $code) {
            $clean = $this->sanitizeCode((string) $code);
            if ($clean !== '') {
                $normalized[$clean] = true;
            }
        }
        $length = strlen($alphabet);
        for ($attempt = 0; $attempt < 40; $attempt++) {
            $segment = '';
            for ($i = 0; $i < 6; $i++) {
                $segment .= $alphabet[random_int(0, $length - 1)];
            }
            $candidate = 'QQ_' . $segment;
            if (!isset($normalized[$candidate])) {
                return $candidate;
            }
        }
        return 'QQ_' . strtoupper(dechex(random_int(0, 0xFFFFFFF)));
    }

    private function generateOptionId(): string
    {
        return 'qo_' . bin2hex(random_bytes(5));
    }

    private function generateBlobId(): string
    {
        return 'qb_' . bin2hex(random_bytes(5));
    }

    /**
     * @param array<int, string> $existingCodes
     */
    private function generateClassCode(array $existingCodes = []): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $normalized = [];
        foreach ($existingCodes as $code) {
            $clean = $this->sanitizeCode((string) $code);
            if ($clean !== '') {
                $normalized[$clean] = true;
            }
        }
        $length = strlen($alphabet);
        for ($attempt = 0; $attempt < 40; $attempt++) {
            $segment = '';
            for ($i = 0; $i < 6; $i++) {
                $segment .= $alphabet[random_int(0, $length - 1)];
            }
            $candidate = 'QA_' . $segment;
            if (!isset($normalized[$candidate])) {
                return $candidate;
            }
        }
        return 'QA_' . strtoupper(dechex(random_int(0, 0xFFFFFFF)));
    }

    private function generateAutoSelectionId(): string
    {
        return 'as_' . bin2hex(random_bytes(5));
    }

    private function sanitizeId(string $value): string
    {
        $value = trim($value);
        if ($value === '' || !preg_match('~^[A-Za-z0-9_\-]+$~', $value)) {
            throw new \RuntimeException('Identifiant de classe invalide.');
        }
        return $value;
    }

    private function sanitizeCode(string $value): string
    {
        $value = trim($value);
        $value = preg_replace('~\s+~', '_', $value) ?? $value;
        $value = strtoupper($value);
        return $value;
    }

    /**
     * @param mixed $input
     */
    private function sanitizeClass($input, bool $forPersist): ?array
    {
        if (!is_array($input)) {
            return null;
        }

        $title = trim((string) ($input['title'] ?? ''));
        $code = $this->sanitizeCode((string) ($input['code'] ?? ''));
        if ($title === '' || $code === '') {
            return null;
        }

        $id = trim((string) ($input['id'] ?? ''));
        if ($id === '') {
            if (!$forPersist) {
                return null;
            }
            $id = $this->generateId();
        } elseif ($forPersist) {
            $id = $this->sanitizeId($id);
        }

        $description = trim((string) ($input['description'] ?? ''));
        $questions = $this->sanitizeQuestions($input['questions'] ?? [], $forPersist);
        $blobs = $this->sanitizeBlobs($input['responseBlobs'] ?? ($input['blobs'] ?? []), $forPersist);
        $autoSelectionsInput = $input['autoSelections'] ?? ($input['metadata']['autoSelections'] ?? []);
        $autoSelections = $this->sanitizeAutoSelections($autoSelectionsInput, $forPersist);
        $metadata = is_array($input['metadata'] ?? null) ? $input['metadata'] : [];
        if (is_array($metadata) && array_key_exists('autoSelections', $metadata)) {
            unset($metadata['autoSelections']);
        }

        $documentId = trim((string) ($input['documentId'] ?? ($metadata['documentId'] ?? '')));
        if ($forPersist) {
            if ($documentId === '') {
                throw new \RuntimeException('Document requis pour la classe de questions.');
            }
            if (!preg_match('~^[A-Za-z0-9_\-]+$~', $documentId)) {
                throw new \RuntimeException('Identifiant de document invalide.');
            }
        }
        if (isset($metadata['documentId'])) {
            unset($metadata['documentId']);
        }
        $documentName = trim((string) ($input['documentName'] ?? ($metadata['documentName'] ?? '')));
        if (isset($metadata['documentName'])) {
            unset($metadata['documentName']);
        }

        return [
            'id' => $id,
            'code' => $code,
            'title' => $title,
            'description' => $description,
            'questions' => $questions,
            'responseBlobs' => $blobs,
            'autoSelections' => $autoSelections,
            'metadata' => $metadata,
            'documentId' => $documentId,
            'documentName' => $documentName,
        ];
    }

    /**
     * @param mixed $input
     * @return array<int, array<string, mixed>>
     */
    private function sanitizeQuestions($input, bool $forPersist): array
    {
        if (!is_array($input)) {
            return [];
        }
        $result = [];
        $usedCodes = [];
        foreach ($input as $question) {
            if (!is_array($question)) {
                continue;
            }
            $label = trim((string) ($question['label'] ?? ''));
            if ($label === '') {
                continue;
            }
            $typeRaw = strtolower(trim((string) ($question['type'] ?? 'open')));
            $allowedTypes = ['dot', 'choice', 'open', 'auto'];
            if (!in_array($typeRaw, $allowedTypes, true)) {
                $typeRaw = 'open';
            }
            $questionId = trim((string) ($question['id'] ?? ''));
            if ($questionId === '') {
                if ($forPersist) {
                    $questionId = $this->generateQuestionId();
                } else {
                    $questionId = null;
                }
            } elseif ($forPersist) {
                $questionId = $this->sanitizeId($questionId);
            }
            if ($questionId === null) {
                continue;
            }

            $coordinate = trim((string) ($question['coordinate'] ?? ''));
            $required = filter_var($question['required'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $allowMultiple = filter_var($question['allowMultiple'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $renderMode = $typeRaw === 'dot' ? 'dot' : ($question['renderMode'] ?? 'standard');
            $code = $this->sanitizeCode((string) ($question['code'] ?? ''));
            if ($forPersist) {
                if ($code === '' || isset($usedCodes[$code])) {
                    $code = $this->generateQuestionCode(array_keys($usedCodes));
                }
                if ($code !== '') {
                    $usedCodes[$code] = true;
                }
            }
            $notes = trim((string) ($question['notes'] ?? ''));
            $metadata = is_array($question['metadata'] ?? null) ? $question['metadata'] : [];

            $options = [];
            if ($typeRaw === 'dot' || $typeRaw === 'choice') {
                foreach ($question['options'] ?? [] as $option) {
                    if (!is_array($option)) {
                        continue;
                    }
                    $labelOption = trim((string) ($option['label'] ?? ''));
                    if ($labelOption === '') {
                        continue;
                    }
                    $optionId = trim((string) ($option['id'] ?? ''));
                    if ($optionId === '') {
                        if ($forPersist) {
                            $optionId = $this->generateOptionId();
                        } else {
                            $optionId = null;
                        }
                    } elseif ($forPersist) {
                        $optionId = $this->sanitizeId($optionId);
                    }
                    if ($optionId === null) {
                        continue;
                    }
                    $optionCoordinate = trim((string) ($option['coordinate'] ?? ''));
                    $optionValue = trim((string) ($option['value'] ?? ''));
                    $optionRequired = filter_var($option['required'] ?? false, FILTER_VALIDATE_BOOLEAN);
                    $followUps = [];
                    if (isset($option['followUps']) && is_array($option['followUps'])) {
                        foreach ($option['followUps'] as $follow) {
                            $followId = trim((string) $follow);
                            if ($followId !== '') {
                                $followUps[] = $followId;
                            }
                        }
                    } elseif (isset($option['requires']) && is_string($option['requires'])) {
                        foreach (explode(',', $option['requires']) as $follow) {
                            $followId = trim($follow);
                            if ($followId !== '') {
                                $followUps[] = $followId;
                            }
                        }
                    }
                    $optionAutoPath = trim((string) ($option['autoPath'] ?? ''));
                    $optionMetadata = is_array($option['metadata'] ?? null) ? $option['metadata'] : [];
                    $options[] = [
                        'id' => $optionId,
                        'label' => $labelOption,
                        'coordinate' => $optionCoordinate,
                        'value' => $optionValue,
                        'required' => $optionRequired,
                        'followUps' => $followUps,
                        'autoPath' => $optionAutoPath,
                        'metadata' => $optionMetadata,
                    ];
                }
            }

            $autoConfig = [];
            if ($typeRaw === 'auto') {
                $source = strtolower(trim((string) ($question['autoSource'] ?? ($question['auto']['source'] ?? 'request'))));
                if (!in_array($source, ['request', 'fused', 'admin'], true)) {
                    $source = 'request';
                }
                $path = trim((string) ($question['autoPath'] ?? ($question['auto']['path'] ?? '')));
                $fallback = trim((string) ($question['autoFallback'] ?? ($question['auto']['fallback'] ?? '')));
                $autoConfig = [
                    'source' => $source,
                    'path' => $path,
                    'fallback' => $fallback,
                ];
            }

            $result[] = [
                'id' => $questionId,
                'label' => $label,
                'type' => $typeRaw,
                'coordinate' => $coordinate,
                'required' => $required,
                'allowMultiple' => $allowMultiple,
                'renderMode' => $renderMode,
                'code' => $code,
                'notes' => $notes,
                'options' => $options,
                'auto' => $autoConfig,
                'metadata' => $metadata,
            ];
        }
        return $result;
    }

    /**
     * @param mixed $input
     * @return array<int, array<string, mixed>>
     */
    private function sanitizeBlobs($input, bool $forPersist): array
    {
        if (!is_array($input)) {
            return [];
        }
        $result = [];
        foreach ($input as $blob) {
            if (!is_array($blob)) {
                continue;
            }
            $label = trim((string) ($blob['label'] ?? ($blob['name'] ?? '')));
            if ($label === '') {
                continue;
            }
            $blobId = trim((string) ($blob['id'] ?? ''));
            if ($blobId === '') {
                if ($forPersist) {
                    $blobId = $this->generateBlobId();
                } else {
                    $blobId = null;
                }
            } elseif ($forPersist) {
                $blobId = $this->sanitizeId($blobId);
            }
            if ($blobId === null) {
                continue;
            }
            $description = trim((string) ($blob['description'] ?? ''));
            $code = $this->sanitizeCode((string) ($blob['code'] ?? ''));
            $answers = [];
            if (isset($blob['answers']) && is_array($blob['answers'])) {
                foreach ($blob['answers'] as $answer) {
                    if (!is_array($answer)) {
                        continue;
                    }
                    $questionId = trim((string) ($answer['questionId'] ?? ''));
                    if ($questionId === '') {
                        continue;
                    }
                    $value = $answer['value'] ?? null;
                    $optionIds = [];
                    if (isset($answer['optionIds']) && is_array($answer['optionIds'])) {
                        foreach ($answer['optionIds'] as $optionId) {
                            $opt = trim((string) $optionId);
                            if ($opt !== '') {
                                $optionIds[] = $opt;
                            }
                        }
                    }
                    $answers[] = [
                        'questionId' => $questionId,
                        'value' => $value,
                        'optionIds' => $optionIds,
                    ];
                }
            }
            $metadata = is_array($blob['metadata'] ?? null) ? $blob['metadata'] : [];
            $result[] = [
                'id' => $blobId,
                'label' => $label,
                'description' => $description,
                'code' => $code,
                'answers' => $answers,
                'metadata' => $metadata,
            ];
        }
        return $result;
    }

    /**
     * @param mixed $input
     * @return array<int, array<string, mixed>>
     */
    private function sanitizeAutoSelections($input, bool $forPersist): array
    {
        if (!is_array($input)) {
            return [];
        }
        $result = [];
        foreach ($input as $entry) {
            if (!is_array($entry)) {
                continue;
            }
            $label = trim((string) ($entry['label'] ?? ''));
            if ($label === '') {
                continue;
            }
            $id = trim((string) ($entry['id'] ?? ''));
            if ($id === '') {
                if ($forPersist) {
                    $id = $this->generateAutoSelectionId();
                } else {
                    $id = null;
                }
            } elseif ($forPersist) {
                $id = $this->sanitizeId($id);
            }
            if ($id === null) {
                continue;
            }
            $requestPath = trim((string) ($entry['requestPath'] ?? ''));
            if ($requestPath === '') {
                continue;
            }
            $conditionTypeRaw = strtolower(trim((string) ($entry['conditionType'] ?? 'contains')));
            $allowedConditions = ['contains', 'not_contains', 'equals', 'not_equals', 'empty', 'not_empty'];
            if (!in_array($conditionTypeRaw, $allowedConditions, true)) {
                $conditionTypeRaw = 'contains';
            }
            $terms = [];
            if (isset($entry['conditionTerms'])) {
                if (is_array($entry['conditionTerms'])) {
                    foreach ($entry['conditionTerms'] as $term) {
                        $value = trim((string) $term);
                        if ($value !== '') {
                            $terms[] = $value;
                        }
                    }
                } elseif (is_string($entry['conditionTerms'])) {
                    foreach (preg_split('~[,\n]+~', $entry['conditionTerms']) ?: [] as $term) {
                        $value = trim($term);
                        if ($value !== '') {
                            $terms[] = $value;
                        }
                    }
                }
            }
            $valueSourceRaw = strtolower(trim((string) ($entry['valueSource'] ?? 'request')));
            $allowedValueSources = ['request', 'literal', 'dot', 'checkmark'];
            $valueSource = in_array($valueSourceRaw, $allowedValueSources, true) ? $valueSourceRaw : 'request';
            $valuePath = trim((string) ($entry['valuePath'] ?? ''));
            $valueLiteral = (string) ($entry['valueLiteral'] ?? '');
            $fallback = (string) ($entry['fallback'] ?? '');
            $coordinate = trim((string) ($entry['coordinate'] ?? ''));
            $notes = trim((string) ($entry['notes'] ?? ''));
            $metadata = is_array($entry['metadata'] ?? null) ? $entry['metadata'] : [];

            $result[] = [
                'id' => $id,
                'label' => $label,
                'requestPath' => $requestPath,
                'conditionType' => $conditionTypeRaw,
                'conditionTerms' => $terms,
                'valueSource' => $valueSource,
                'valuePath' => $valuePath,
                'valueLiteral' => $valueLiteral,
                'fallback' => $fallback,
                'coordinate' => $coordinate,
                'notes' => $notes,
                'metadata' => $metadata,
            ];
        }
        return $result;
    }
}