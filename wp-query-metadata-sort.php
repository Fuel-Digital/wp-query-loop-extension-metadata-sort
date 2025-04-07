<?php
/**
 *
 * Plugin Name:       WP Query Block Extension - Metadata Sort
 * Description:       Add metadata support to Query Loop Block Sort.
 * Version:           2.0
 * Author:            Kelvin Xu
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       wp-query-block-extension
 *
 * @package ubc_query_block_extension
 * @see https://github.com/ubc/wp-query-loop-extension-metadata-sort/tree/master
 * @see https://github.com/orgs/ubc/repositories?type=all&q=query+loop
 */

namespace fuel\metaSort;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	die;
}



/**
 * Enqueue block assets.
 *
 * @return void
 */
function enqueue_assets() {
	wp_enqueue_script(
		'wp-query-block-metadata-sort-js',
		plugin_dir_url( __FILE__ ) . 'build/script.js',
		array(),
		filemtime( plugin_dir_path( __FILE__ ) . 'build/script.js' ),
		true
	);

	wp_localize_script(
		'wp-query-block-metadata-sort-js',
		'wp_query_block_metadata_sort',
		array(
			'nonce' => wp_create_nonce( 'metadata_sort_ajax' ),
		)
	);
}//end enqueue_assets()
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\\enqueue_assets' );



/**
 * Add query args to post and page rest endpoint.
 *
 * @param  array           $args Array of arguments for WP_Query.
 * @param  WP_REST_Request $request The REST API request.
 * @return array
 */
function sort_post_by_metadata( $args, $request ) {
	if ( ! isset( $request['metaKey'] ) ) {
		return $args;
	}

	// Secure the meta sort to same host ONLY.
	if ( $request->get_headers()['host'][0] !== $_SERVER['HTTP_HOST'] ) {
		return $args;
	}

	$args['meta_key'] = sanitize_text_field( $request['metaKey'] );

	return $args;
}//end sort_post_by_metadata()



/**
 * Add meta_value to the list of permitted orderby values
 *
 * @param array $params WP Query parameters.
 * @return array
 */
function add_rest_orderby_params( $params ) {
	$params['orderby']['enum'][] = 'meta_value';
	return $params;
}



/**
 * Run the two functions above on all post types that have show_in_rest set to true.
 */
add_action( 'rest_api_init', function () {
	$post_types = get_post_types( [ 'show_in_rest' => true ], 'objects' );

	foreach ( $post_types as $post_type ) {
		$rest_base = $post_type->rest_base ?: $post_type->name;

		add_filter( "rest_{$rest_base}_query", __NAMESPACE__ . '\\sort_post_by_metadata', 10, 2 );
		add_filter( "rest_{$rest_base}_collection_params", __NAMESPACE__ . '\\add_rest_orderby_params', 10, 1 );
	}
});



/**
 * Update query args for blocks that inherits the main query loop block.
 *
 * @param  array    $query Array containing parameters for WP_Query as parsed by the block context.
 * @param  WP_Block $block Block instance.
 * @param  int      $page Current query's page.
 * @return array
 */
function update_query_args( $query, $block, $page ) {
	if ( isset( $block->context['query']['metaKey'] ) ) {
		$query['meta_key'] = sanitize_text_field( $block->context['query']['metaKey'] );
	}

	if ( isset( $block->context['query']['metaType'] ) ) {
		$query['meta_type'] = sanitize_text_field( $block->context['query']['metaType'] );
	}

	return $query;
}
add_filter( 'query_loop_block_query_vars', __NAMESPACE__ . '\\update_query_args', 10, 3 );



/**
 * Ajax request handler to return the list of meta keys from the post meta table.
 *
 * @return void
 */
function get_meta_keys() {
	if ( ! wp_verify_nonce( $_POST['nonce'], 'metadata_sort_ajax' ) ) {
		wp_send_json_error( 'Invalid nonce' );
	}

	global $wpdb;

	$post_type = sanitize_text_field( $_POST['post_type'] ?? '' );
	if ( empty( $post_type ) ) {
		wp_send_json_error( 'No post type provided' );
	}

	// Check transient specific to post type
	$transient_key = 'wp_metadata_get_keys_' . $post_type;
	$keys = get_transient( $transient_key );
	if ( false !== $keys ) {
		wp_send_json_success( $keys );
	}

	// Get post IDs of the post type
	$post_ids = $wpdb->get_col( $wpdb->prepare(
		"SELECT ID FROM $wpdb->posts WHERE post_type = %s",
		$post_type
	) );

	if ( empty( $post_ids ) ) {
		wp_send_json_success( [] );
	}

	$post_ids_placeholders = implode(',', array_map('absint', $post_ids));

	// Get distinct meta_keys for those post IDs
	$keys = $wpdb->get_col(
		"SELECT DISTINCT meta_key
		 FROM $wpdb->postmeta
		 WHERE post_id IN ($post_ids_placeholders)
		 AND meta_key NOT BETWEEN '_' AND '_z'
		 AND meta_key NOT LIKE '\_%'
		 ORDER BY meta_key"
	);

	set_transient( $transient_key, $keys, HOUR_IN_SECONDS );
	wp_send_json_success( $keys );
}//end get_meta_keys()
add_action( 'wp_ajax_metadata_sort_get_meta_keys', __NAMESPACE__ . '\\get_meta_keys' );



/**
 * Delete `wp_metadata_filter_get_keys` transient when any of the post metas is updated.
 */
function reset_metakeys_transient() {
	if ( false !== get_transient( 'wp_metadata_get_keys' ) ) {
		delete_transient( 'wp_metadata_get_keys' );
	}
}//end reset_metakeys_transient()
add_action( 'updated_post_meta', __NAMESPACE__ . '\\reset_metakeys_transient' );