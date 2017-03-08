<?php

error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);

require __DIR__ . '/vendor/autoload.php';

use SimpleExcel\SimpleExcel;

$years = getYears();
createCleanFiles($years);
compareHeaders($years);

function compareHeaders ($years) {
  $all_columns = [];

  foreach ($years as $year) {
    $excel = new SimpleExcel('csv');
    $excel->parser->loadFile('cache/' . $year . '.csv');
    $headers = $excel->parser->getRow(1);

    foreach ($headers as $header) {
      $all_columns[$header] = $header;
    }
  }

  unset($all_columns['']);
  $all_columns = array_values($all_columns);
  sort($all_columns);

  print_r($all_columns);
}

function createCleanFiles ($years) {
  foreach ($years as $year) {
    $csv_contents = file_get_contents('data/' . $year . '.csv');
    $csv_exploded = explode("\n\n\n", $csv_contents);
    $file_contents = str_replace("\n" . 'This file is created with Aspose.Cells for evaluation only with an Evaluation License. 
It is strictly prohibited from using it in the production of any software. 
Any violation of this provision shall require a mandatory purchase of pay license 
as well as expose the user to other legal recourse for collection and punitive damages.', '', $csv_exploded[1]);

    $file_contents = str_replace(' %', '', $file_contents);
    $file_contents = str_replace('"', '', $file_contents);

    file_put_contents('cache/' . $year . '.csv', $file_contents);
  }
}

function getYears () {
  $csv_files = scandir('data');
  unset($csv_files[0]);
  unset($csv_files[1]);

  $years = [];

  foreach ($csv_files as $csv_file) {
    $years[] = str_replace('.csv', '', $csv_file);
  }

  return $years;
}

