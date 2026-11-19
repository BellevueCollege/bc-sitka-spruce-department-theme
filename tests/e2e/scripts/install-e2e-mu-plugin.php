<?php
/**
 * Copy the e2e mu-plugin from the theme mount into the WordPress mu-plugins directory.
 *
 * Runs inside the wp-env Linux CLI container (host OS may be Windows or macOS).
 * Avoids Docker Desktop bind mounts of this file, which go stale (Links:0 / include ENOENT).
 */

$sourcePath = '/var/www/html/wp-content/themes/bc-sitka-spruce-department-theme/tests/e2e/mu-plugins/e2e-seed-endpoint.php';
$destinationDirectory = '/var/www/html/wp-content/mu-plugins';
$destinationPath = $destinationDirectory . '/e2e-seed-endpoint.php';

if ( ! is_readable( $sourcePath ) ) {
	fwrite( STDERR, "source_readable=0\n" );
	exit( 1 );
}

if ( ! is_dir( $destinationDirectory ) && ! mkdir( $destinationDirectory, 0755, true ) ) {
	fwrite( STDERR, "mkdir_failed=1\n" );
	exit( 1 );
}

if ( ! copy( $sourcePath, $destinationPath ) ) {
	fwrite( STDERR, "copy_failed=1\n" );
	exit( 1 );
}

$destinationContents = file_get_contents( $destinationPath );
if ( false === $destinationContents || strlen( $destinationContents ) < 100 ) {
	fwrite( STDERR, "dest_readable=0\n" );
	exit( 1 );
}

echo "source_readable=1\n";
echo "dest_readable=1\n";
echo 'dest_bytes=' . strlen( $destinationContents ) . "\n";
exit( 0 );
