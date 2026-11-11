<?php
// Kontaktformular: nimmt die Anfrage per POST entgegen und verschickt sie als E-Mail.
// Läuft auf dem ALL-INKL-Webspace (PHP mail()). Antwort immer als JSON.

const EMPFAENGER = 'marku.services@gmail.com';
// Absender muss eine Adresse der eigenen Domain sein, sonst landet die Mail im Spam.
const ABSENDER   = 'kontakt@marku-gebaeudeservice.de';
const MIN_SEKUNDEN = 3; // schneller ausgefüllte Formulare stammen fast immer von Bots

date_default_timezone_set('Europe/Berlin');
mb_internal_encoding('UTF-8');
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function antwort(int $status, bool $ok, string $text): void {
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'message' => $text], JSON_UNESCAPED_UNICODE);
    exit;
}

function feld(string $name, int $max): string {
    $v = isset($_POST[$name]) && is_string($_POST[$name]) ? trim($_POST[$name]) : '';
    return mb_substr($v, 0, $max);
}

// Für Kopfzeilen: Zeilenumbrüche entfernen (verhindert Header-Injection)
function einzeilig(string $v): string {
    return trim(preg_replace('/[\r\n\t]+/', ' ', $v));
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    antwort(405, false, 'Nur POST erlaubt.');
}

// Spam-Schutz: verstecktes Feld muss leer bleiben, Formular darf nicht zu schnell abgeschickt werden.
// Bots bekommen eine Erfolgsmeldung, damit sie es nicht weiter versuchen.
$gestartet = (int) feld('started', 20);
if (feld('website', 200) !== '' || ($gestartet > 0 && (time() * 1000 - $gestartet) < MIN_SEKUNDEN * 1000)) {
    antwort(200, true, 'Vielen Dank!');
}

$name    = einzeilig(feld('name', 100));
$telefon = einzeilig(feld('phone', 50));
$email   = einzeilig(feld('email', 150));
$ort     = einzeilig(feld('place', 150));
$leistung = einzeilig(feld('service', 100));
$nachricht = str_replace("\r\n", "\n", feld('message', 5000));
$zustimmung = feld('consent', 10);

if ($name === '' || $nachricht === '') {
    antwort(422, false, 'Bitte geben Sie Ihren Namen und eine Nachricht ein.');
}
if ($zustimmung === '') {
    antwort(422, false, 'Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.');
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    antwort(422, false, 'Bitte prüfen Sie Ihre E-Mail-Adresse.');
}
if ($email === '' && $telefon === '') {
    antwort(422, false, 'Bitte geben Sie eine Telefonnummer oder E-Mail-Adresse an, damit wir Sie erreichen können.');
}

$zeilen = ['Neue Anfrage über die Website marku-gebaeudeservice.de', '', 'Name: ' . $name];
if ($telefon !== '')  $zeilen[] = 'Telefon: ' . $telefon;
if ($email !== '')    $zeilen[] = 'E-Mail: ' . $email;
if ($ort !== '')      $zeilen[] = 'Ort/Objekt: ' . $ort;
if ($leistung !== '') $zeilen[] = 'Leistung: ' . $leistung;
$zeilen[] = '';
$zeilen[] = 'Nachricht:';
$zeilen[] = $nachricht;
$zeilen[] = '';
$zeilen[] = '—';
$zeilen[] = 'Gesendet am ' . date('d.m.Y \u\m H:i') . ' Uhr';
if ($email !== '') $zeilen[] = 'Auf diese E-Mail antworten, um direkt dem Kunden zu schreiben.';
$text = implode("\n", $zeilen);

$betreff = 'Anfrage' . ($leistung !== '' ? ': ' . $leistung : '') . ' – ' . $name;

$kopf = [
    'From: ' . mb_encode_mimeheader('MARKU Website', 'UTF-8') . ' <' . ABSENDER . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];
if ($email !== '') {
    $kopf[] = 'Reply-To: ' . mb_encode_mimeheader($name, 'UTF-8') . ' <' . $email . '>';
}

$gesendet = mail(
    EMPFAENGER,
    mb_encode_mimeheader($betreff, 'UTF-8'),
    $text,
    implode("\r\n", $kopf),
    '-f' . ABSENDER
);

if (!$gesendet) {
    antwort(500, false, 'Die Nachricht konnte gerade nicht gesendet werden.');
}
antwort(200, true, 'Vielen Dank! Ihre Anfrage ist bei uns angekommen. Wir melden uns schnellstmöglich bei Ihnen.');
