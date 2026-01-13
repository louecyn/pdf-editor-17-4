<?php
declare(strict_types=1);

namespace App\Vendor\PdfCompat;

use RuntimeException;

final class PdfCompat
{
    private const TRAILER_ALLOWED_KEYS = ['Size', 'Root', 'Info', 'ID', 'Encrypt'];

    public static function normalizeFile(string $inPath, string $outPath): void
    {
        if (!is_file($inPath)) {
            throw new RuntimeException('Fichier PDF source introuvable.');
        }
        $data = file_get_contents($inPath);
        if ($data === false) {
            throw new RuntimeException('Impossible de lire le fichier PDF source.');
        }
        $normalized = self::normalizeBuffer($data);
        if (file_put_contents($outPath, $normalized) === false) {
            throw new RuntimeException('Impossible d\'écrire le PDF normalisé.');
        }
    }

    public static function normalizeBuffer(string $pdfBinary): string
    {
        if ($pdfBinary === '') {
            throw new RuntimeException('Flux PDF vide.');
        }

        $objects = self::extractObjects($pdfBinary);
        if ($objects === []) {
            throw new RuntimeException('Aucun objet PDF détecté.');
        }

        $objectMap = [];
        $catalogRef = null;
        $trailerDict = self::extractTrailerDictionary($pdfBinary);
        $maxObjectNumber = 0;

        foreach ($objects as $entry) {
            $maxObjectNumber = max($maxObjectNumber, $entry['number']);
            if ($entry['type'] === 'objstm') {
                $decodedObjects = self::expandObjectStream($entry);
                foreach ($decodedObjects as $decoded) {
                    $objectMap[$decoded['number']] = [
                        'generation' => $decoded['generation'],
                        'content' => $decoded['content'],
                    ];
                    $maxObjectNumber = max($maxObjectNumber, $decoded['number']);
                    $dict = self::extractDictionary($decoded['content']);
                    if ($catalogRef === null && $dict !== null && self::isName($dict['Type'] ?? null, 'Catalog')) {
                        $catalogRef = ['type' => 'ref', 'value' => [$decoded['number'], 0]];
                    }
                }
                $trailerDict = self::mergeTrailerDictionary($trailerDict, $entry['dictionary']);
                continue;
            }

            if ($entry['type'] === 'xref') {
                $trailerDict = self::mergeTrailerDictionary($trailerDict, $entry['dictionary']);
                continue;
            }

            $objectMap[$entry['number']] = [
                'generation' => $entry['generation'],
                'content' => self::normalizeObjectContent($entry['rawContent']),
            ];
            if ($catalogRef === null && $entry['dictionary'] !== null && self::isName($entry['dictionary']['Type'] ?? null, 'Catalog')) {
                $catalogRef = ['type' => 'ref', 'value' => [$entry['number'], $entry['generation']]];
            }
        }

        if ($catalogRef === null) {
            $catalogRef = self::findCatalogReference($objectMap);
        }

        if ($catalogRef === null) {
            throw new RuntimeException('Impossible de déterminer le catalogue du document.');
        }

        $trailerDict = self::buildTrailerDictionary($trailerDict, $catalogRef, $objectMap);

        ksort($objectMap, SORT_NUMERIC);

        $output = "%PDF-1.4\n%âãÏÓ\n";
        $offsets = [];

        foreach ($objectMap as $number => $definition) {
            $generation = (int)$definition['generation'];
            $offsets[$number] = strlen($output);
            $output .= $number . ' ' . $generation . " obj\n";
            $output .= rtrim($definition['content']) . "\nendobj\n";
        }

        $maxId = $objectMap === [] ? 0 : (int)max(array_keys($objectMap));
        $xrefPosition = strlen($output);
        $size = $maxId + 1;

        $output .= "xref\n";
        $output .= '0 ' . $size . "\n";
        $output .= sprintf("%010d %05d f \n", 0, 65535);

        for ($i = 1; $i < $size; $i++) {
            if (isset($offsets[$i])) {
                $generation = (int)$objectMap[$i]['generation'];
                $output .= sprintf("%010d %05d n \n", $offsets[$i], $generation);
            } else {
                $output .= sprintf("%010d %05d f \n", 0, 65535);
            }
        }

        $output .= "trailer\n";
        $output .= self::serializeValue(['type' => 'dict', 'value' => $trailerDict]);
        $output .= "\nstartxref\n" . $xrefPosition . "\n%%EOF\n";

        return $output;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private static function extractObjects(string $pdfBinary): array
    {
        $pattern = '/(\d+)\s+(\d+)\s+obj\b/';
        if (!preg_match_all($pattern, $pdfBinary, $matches, PREG_OFFSET_CAPTURE)) {
            return [];
        }

        $objects = [];
        $count = count($matches[0]);
        for ($i = 0; $i < $count; $i++) {
            $objectNumber = (int)$matches[1][$i][0];
            $generationNumber = (int)$matches[2][$i][0];
            $startOffset = $matches[0][$i][1] + strlen($matches[0][$i][0]);
            $endOffset = strpos($pdfBinary, 'endobj', $startOffset);
            if ($endOffset === false) {
                throw new RuntimeException('Objet PDF mal formé (fin manquante).');
            }
            $rawContent = substr($pdfBinary, $startOffset, $endOffset - $startOffset);
            $dictionary = self::extractDictionary($rawContent);
            $type = 'regular';
            if ($dictionary !== null) {
                if (self::isName($dictionary['Type'] ?? null, 'ObjStm')) {
                    $type = 'objstm';
                } elseif (self::isName($dictionary['Type'] ?? null, 'XRef')) {
                    $type = 'xref';
                }
            }
            $objects[] = [
                'number' => $objectNumber,
                'generation' => $generationNumber,
                'rawContent' => $rawContent,
                'dictionary' => $dictionary,
                'type' => $type,
            ];
        }

        return $objects;
    }

    /**
     * @return array<string, mixed>|null
     */
    private static function extractDictionary(string $objectContent): ?array
    {
        $content = ltrim($objectContent);
        $dictString = self::extractDictionaryString($content);
        if ($dictString === null) {
            return null;
        }
        $tokens = self::tokenize($dictString);
        $position = 0;
        $parsed = self::parseDictionaryTokens($tokens, $position);
        return $parsed['value'];
    }

    private static function extractDictionaryString(string $content): ?string
    {
        $start = strpos($content, '<<');
        if ($start === false) {
            return null;
        }
        $depth = 0;
        $length = strlen($content);
        for ($i = $start; $i < $length - 1; $i++) {
            $pair = $content[$i] . $content[$i + 1];
            if ($pair === '<<') {
                $depth++;
                $i++;
                continue;
            }
            if ($pair === '>>') {
                $depth--;
                $i++;
                if ($depth === 0) {
                    $end = $i + 1;
                    return substr($content, $start, $end - $start);
                }
                continue;
            }
        }
        return null;
    }

    /**
     * @param array<int, array<string, mixed>> $objectStreamEntry
     * @return array<int, array<string, mixed>>
     */
    private static function expandObjectStream(array $objectStreamEntry): array
    {
        $dictionary = $objectStreamEntry['dictionary'];
        if ($dictionary === null) {
            throw new RuntimeException('Objet stream sans dictionnaire.');
        }
        [$streamData] = self::extractStreamData($objectStreamEntry['rawContent']);
        if ($streamData === null) {
            throw new RuntimeException('Données manquantes dans l\'objet stream.');
        }
        $decoded = self::decodeStream($dictionary, $streamData);
        $numObjects = self::requireNumber($dictionary, 'N');
        $firstOffset = self::requireNumber($dictionary, 'First');
        if ($firstOffset < 0 || $firstOffset > strlen($decoded)) {
            throw new RuntimeException('Offset d\'objet stream invalide.');
        }
        $header = substr($decoded, 0, $firstOffset);
        $body = substr($decoded, $firstOffset);
        $parts = preg_split('/\s+/', trim($header));
        if ($parts === false || count($parts) < $numObjects * 2) {
            throw new RuntimeException('En-tête d\'objet stream invalide.');
        }

        $objects = [];
        $boundaries = [];
        for ($i = 0; $i < $numObjects; $i++) {
            $objectNumber = (int)$parts[$i * 2];
            $offset = (int)$parts[$i * 2 + 1];
            $boundaries[] = ['number' => $objectNumber, 'offset' => $offset];
        }
        $boundaries[] = ['number' => null, 'offset' => strlen($body)];

        $count = count($boundaries) - 1;
        for ($i = 0; $i < $count; $i++) {
            $start = $boundaries[$i]['offset'];
            $end = $boundaries[$i + 1]['offset'];
            if ($end < $start) {
                $end = strlen($body);
            }
            $content = substr($body, $start, $end - $start);
            $objects[] = [
                'number' => (int)$boundaries[$i]['number'],
                'generation' => 0,
                'content' => trim($content),
            ];
        }

        return $objects;
    }

    private static function normalizeObjectContent(string $content): string
    {
        $normalized = ltrim($content);
        return rtrim($normalized);
    }

    private static function mergeTrailerDictionary(?array $existing, ?array $candidate): ?array
    {
        if ($candidate === null) {
            return $existing;
        }
        $filtered = [];
        foreach (self::TRAILER_ALLOWED_KEYS as $key) {
            if (isset($candidate[$key])) {
                $filtered[$key] = $candidate[$key];
            }
        }
        if ($existing === null) {
            return $filtered ?: null;
        }
        foreach ($filtered as $key => $value) {
            $existing[$key] = $value;
        }
        return $existing;
    }

    /**
     * @param array<int, array<string, mixed>> $objectMap
     * @return array<string, mixed>
     */
    private static function buildTrailerDictionary(?array $trailer, array $catalogRef, array $objectMap): array
    {
        $dictionary = $trailer ?? [];
        unset($dictionary['Prev']);
        $dictionary['Size'] = ['type' => 'number', 'value' => (string)(($objectMap === []) ? 1 : (max(array_keys($objectMap)) + 1))];
        if (!isset($dictionary['Root'])) {
            $dictionary['Root'] = $catalogRef;
        }
        if (!isset($dictionary['Root'])) {
            throw new RuntimeException('Le catalogue PDF est introuvable.');
        }
        return $dictionary;
    }

    /**
     * @param array<int, array<string, mixed>> $objectMap
     * @return array<string, mixed>|null
     */
    private static function findCatalogReference(array $objectMap): ?array
    {
        foreach ($objectMap as $number => $definition) {
            $dictionary = self::extractDictionary($definition['content']);
            if ($dictionary !== null && self::isName($dictionary['Type'] ?? null, 'Catalog')) {
                return ['type' => 'ref', 'value' => [$number, (int)$definition['generation']]];
            }
        }
        return null;
    }

    private static function extractTrailerDictionary(string $pdfBinary): ?array
    {
        if (!preg_match_all('/trailer\s*<<(.*?)>>/s', $pdfBinary, $matches)) {
            return null;
        }
        $last = end($matches[0]);
        if (!is_string($last)) {
            return null;
        }
        $dictString = substr($last, strpos($last, '<<'));
        if ($dictString === false) {
            return null;
        }
        $tokens = self::tokenize($dictString);
        $position = 0;
        $parsed = self::parseDictionaryTokens($tokens, $position);
        return $parsed['value'];
    }

    private static function requireNumber(array $dictionary, string $key): int
    {
        if (!isset($dictionary[$key]) || $dictionary[$key]['type'] !== 'number') {
            throw new RuntimeException(sprintf('Clé numérique manquante (%s).', $key));
        }
        return (int)$dictionary[$key]['value'];
    }

    private static function decodeStream(array $dictionary, string $data): string
    {
        $filter = $dictionary['Filter'] ?? null;
        if ($filter === null) {
            return $data;
        }
        $filters = [];
        if ($filter['type'] === 'name') {
            $filters[] = $filter['value'];
        } elseif ($filter['type'] === 'array') {
            foreach ($filter['value'] as $entry) {
                if ($entry['type'] !== 'name') {
                    throw new RuntimeException('Filtre PDF non pris en charge.');
                }
                $filters[] = $entry['value'];
            }
        } else {
            throw new RuntimeException('Filtre PDF non pris en charge.');
        }

        $decoded = $data;
        foreach ($filters as $single) {
            if ($single !== 'FlateDecode') {
                throw new RuntimeException(sprintf('Filtre %s non supporté.', (string)$single));
            }
            $decoded = self::flateDecode($decoded);
        }
        return $decoded;
    }

    private static function flateDecode(string $data): string
    {
        $decoded = @zlib_decode($data);
        if ($decoded !== false) {
            return $decoded;
        }
        $decoded = @gzuncompress($data);
        if ($decoded !== false) {
            return $decoded;
        }
        $decoded = @gzinflate($data);
        if ($decoded !== false) {
            return $decoded;
        }
        $trimmed = rtrim($data, "\r\n");
        $decoded = @zlib_decode($trimmed);
        if ($decoded !== false) {
            return $decoded;
        }
        throw new RuntimeException('Impossible de décompresser un flux FlateDecode.');
    }

    /**
     * @return array{0: string|null, 1: string, 2: string}
     */
    private static function extractStreamData(string $content): array
    {
        $streamPos = strpos($content, 'stream');
        if ($streamPos === false) {
            return [null, $content, ''];
        }
        $after = $streamPos + 6;
        if (isset($content[$after]) && $content[$after] === "\r" && isset($content[$after + 1]) && $content[$after + 1] === "\n") {
            $dataStart = $after + 2;
        } elseif (isset($content[$after]) && ($content[$after] === "\n")) {
            $dataStart = $after + 1;
        } else {
            $dataStart = $after;
        }
        $endPos = strrpos($content, 'endstream');
        if ($endPos === false) {
            throw new RuntimeException('Balise endstream manquante.');
        }
        $data = substr($content, $dataStart, $endPos - $dataStart);
        $prefix = substr($content, 0, $streamPos);
        $suffix = substr($content, $endPos + 9);
        return [$data, $prefix, $suffix];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private static function tokenize(string $input): array
    {
        $tokens = [];
        $length = strlen($input);
        $i = 0;
        while ($i < $length) {
            $char = $input[$i];
            if (ctype_space($char)) {
                $i++;
                continue;
            }
            if ($char === '%') {
                while ($i < $length && $input[$i] !== "\r" && $input[$i] !== "\n") {
                    $i++;
                }
                continue;
            }
            if ($char === '<' && $i + 1 < $length && $input[$i + 1] === '<') {
                $tokens[] = ['type' => 'dictStart'];
                $i += 2;
                continue;
            }
            if ($char === '>' && $i + 1 < $length && $input[$i + 1] === '>') {
                $tokens[] = ['type' => 'dictEnd'];
                $i += 2;
                continue;
            }
            if ($char === '[') {
                $tokens[] = ['type' => 'arrayStart'];
                $i++;
                continue;
            }
            if ($char === ']') {
                $tokens[] = ['type' => 'arrayEnd'];
                $i++;
                continue;
            }
            if ($char === '/') {
                $i++;
                $start = $i;
                while ($i < $length && !ctype_space($input[$i]) && !in_array($input[$i], ['[', ']', '<', '>', '(', ')', '/'], true)) {
                    $i++;
                }
                $tokens[] = ['type' => 'name', 'value' => substr($input, $start, $i - $start)];
                continue;
            }
            if ($char === '(') {
                $i++;
                $buffer = '';
                $depth = 0;
                while ($i < $length) {
                    $c = $input[$i];
                    if ($c === '\\') {
                        $buffer .= $c;
                        $i++;
                        if ($i < $length) {
                            $buffer .= $input[$i];
                            $i++;
                        }
                        continue;
                    }
                    if ($c === '(') {
                        $depth++;
                        $buffer .= $c;
                        $i++;
                        continue;
                    }
                    if ($c === ')') {
                        if ($depth === 0) {
                            $i++;
                            break;
                        }
                        $depth--;
                        $buffer .= $c;
                        $i++;
                        continue;
                    }
                    $buffer .= $c;
                    $i++;
                }
                $tokens[] = ['type' => 'string', 'value' => $buffer];
                continue;
            }
            if ($char === '<') {
                $i++;
                $start = $i;
                while ($i < $length && $input[$i] !== '>') {
                    $i++;
                }
                $value = substr($input, $start, $i - $start);
                if ($i < $length && $input[$i] === '>') {
                    $i++;
                }
                $tokens[] = ['type' => 'hex', 'value' => $value];
                continue;
            }
            if ($char === '+' || $char === '-' || $char === '.' || ctype_digit($char)) {
                $start = $i;
                $i++;
                while ($i < $length && (ctype_digit($input[$i]) || $input[$i] === '.')) {
                    $i++;
                }
                $tokens[] = ['type' => 'number', 'value' => substr($input, $start, $i - $start)];
                continue;
            }
            $start = $i;
            while ($i < $length && !ctype_space($input[$i]) && !in_array($input[$i], ['[', ']', '<', '>', '(', ')', '/'], true)) {
                $i++;
            }
            $tokens[] = ['type' => 'keyword', 'value' => substr($input, $start, $i - $start)];
        }
        return $tokens;
    }

    /**
     * @param array<int, array<string, mixed>> $tokens
     * @return array{type: string, value: array<string, mixed>}
     */
    private static function parseDictionaryTokens(array $tokens, int &$position): array
    {
        if (!isset($tokens[$position]) || $tokens[$position]['type'] !== 'dictStart') {
            throw new RuntimeException('Dictionnaire PDF mal formé.');
        }
        $position++;
        $result = [];
        $count = count($tokens);
        while ($position < $count) {
            $token = $tokens[$position];
            if ($token['type'] === 'dictEnd') {
                $position++;
                break;
            }
            if ($token['type'] !== 'name') {
                throw new RuntimeException('Clé de dictionnaire inattendue.');
            }
            $key = $token['value'];
            $position++;
            $result[$key] = self::parseValueTokens($tokens, $position);
        }
        return ['type' => 'dict', 'value' => $result];
    }

    /**
     * @param array<int, array<string, mixed>> $tokens
     * @return array<string, mixed>
     */
    private static function parseValueTokens(array $tokens, int &$position): array
    {
        if (!isset($tokens[$position])) {
            throw new RuntimeException('Valeur PDF manquante.');
        }
        $token = $tokens[$position];
        $position++;
        switch ($token['type']) {
            case 'dictStart':
                $position--;
                $dictionary = self::parseDictionaryTokens($tokens, $position);
                return $dictionary;
            case 'arrayStart':
                $values = [];
                $count = count($tokens);
                while ($position < $count && $tokens[$position]['type'] !== 'arrayEnd') {
                    $values[] = self::parseValueTokens($tokens, $position);
                }
                if ($position >= $count || $tokens[$position]['type'] !== 'arrayEnd') {
                    throw new RuntimeException('Fin de tableau manquante.');
                }
                $position++;
                return ['type' => 'array', 'value' => $values];
            case 'name':
                return ['type' => 'name', 'value' => $token['value']];
            case 'string':
                return ['type' => 'string', 'value' => $token['value']];
            case 'hex':
                return ['type' => 'hex', 'value' => $token['value']];
            case 'number':
                if (isset($tokens[$position], $tokens[$position + 1])
                    && $tokens[$position]['type'] === 'number'
                    && $tokens[$position + 1]['type'] === 'keyword'
                    && $tokens[$position + 1]['value'] === 'R') {
                    $first = (int)$token['value'];
                    $second = (int)$tokens[$position]['value'];
                    $position += 2;
                    return ['type' => 'ref', 'value' => [$first, $second]];
                }
                return ['type' => 'number', 'value' => $token['value']];
            case 'keyword':
                $value = $token['value'];
                if ($value === 'true' || $value === 'false') {
                    return ['type' => 'bool', 'value' => $value === 'true'];
                }
                if ($value === 'null') {
                    return ['type' => 'null', 'value' => null];
                }
                return ['type' => 'keyword', 'value' => $value];
            default:
                throw new RuntimeException('Type de valeur PDF inattendu.');
        }
    }

    private static function serializeValue(array $value): string
    {
        switch ($value['type']) {
            case 'name':
                return '/' . $value['value'];
            case 'number':
                return (string)$value['value'];
            case 'bool':
                return $value['value'] ? 'true' : 'false';
            case 'null':
                return 'null';
            case 'string':
                return '(' . self::escapeString((string)$value['value']) . ')';
            case 'hex':
                return '<' . strtoupper((string)$value['value']) . '>';
            case 'ref':
                return $value['value'][0] . ' ' . $value['value'][1] . ' R';
            case 'keyword':
                return (string)$value['value'];
            case 'array':
                $items = array_map(static fn($item) => self::serializeValue($item), $value['value']);
                return '[' . implode(' ', $items) . ']';
            case 'dict':
                $parts = [];
                foreach ($value['value'] as $key => $entry) {
                    $parts[] = '/' . $key . ' ' . self::serializeValue($entry);
                }
                return '<<' . implode(' ', $parts) . '>>';
        }
        throw new RuntimeException('Impossible de sérialiser la valeur PDF.');
    }

    private static function escapeString(string $value): string
    {
        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $value);
    }

    private static function isName($value, string $expected): bool
    {
        return is_array($value) && ($value['type'] ?? null) === 'name' && ($value['value'] ?? null) === $expected;
    }
}