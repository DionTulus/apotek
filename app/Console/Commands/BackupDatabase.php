<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class BackupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:backup-db';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backup database MySQL schema and data to database/dump/ directory';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Memulai pencadangan database Apotek ERP...');

        $dumpDir = base_path('database/dump');
        if (!File::exists($dumpDir)) {
            File::makeDirectory($dumpDir, 0755, true);
        }

        $backupFile = $dumpDir . '/apotek_erp.sql';
        $timestampBackup = $dumpDir . '/backup_' . date('Y_m_d_His') . '.sql';

        $tables = DB::select('SHOW TABLES');
        $dbName = DB::getDatabaseName();
        $tableKey = 'Tables_in_' . $dbName;

        $sqlContent = "-- ========================================================\n";
        $sqlContent .= "-- Apotek ERP Database Backup\n";
        $sqlContent .= "-- Generated at: " . date('Y-m-d H:i:s') . "\n";
        $sqlContent .= "-- ========================================================\n\n";
        $sqlContent .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $tableObj) {
            $tableName = $tableObj->$tableKey ?? current((array) $tableObj);

            // Skip migrations / jobs if needed, or include all
            $createTable = DB::select("SHOW CREATE TABLE `{$tableName}`");
            $createSql = $createTable[0]->{'Create Table'} ?? '';

            $sqlContent .= "-- Table structure for `{$tableName}`\n";
            $sqlContent .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
            $sqlContent .= $createSql . ";\n\n";

            // Dump data
            $rows = DB::table($tableName)->get();
            if ($rows->count() > 0) {
                $sqlContent .= "-- Dumping data for `{$tableName}`\n";
                foreach ($rows as $row) {
                    $rowArray = (array) $row;
                    $escapedValues = array_map(function ($val) {
                        if (is_null($val)) return 'NULL';
                        return "'" . addslashes((string) $val) . "'";
                    }, $rowArray);

                    $sqlContent .= "INSERT INTO `{$tableName}` (`" . implode('`, `', array_keys($rowArray)) . "`) VALUES (" . implode(', ', $escapedValues) . ");\n";
                }
                $sqlContent .= "\n";
            }
        }

        $sqlContent .= "SET FOREIGN_KEY_CHECKS=1;\n";

        File::put($backupFile, $sqlContent);
        File::put($timestampBackup, $sqlContent);

        $this->info("Pencadangan database berhasil disimpan ke:\n - {$backupFile}\n - {$timestampBackup}");

        return Command::SUCCESS;
    }
}
