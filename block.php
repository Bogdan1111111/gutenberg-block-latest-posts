<?php
// plugin name: Block
function blocks_scripts()
{
    // скрываем блок если нет категорий
    if (!empty($cats = blocks_get_categories())) {
        // подключаем блок
        wp_enqueue_script(
            'gutenberg-latest-posts',
            plugins_url('/block/script-compiled.js'),
            ['wp-blocks','wp-element','wp-i18n', 'wp-editor'],
            102,
            true
        );
        // создаем обьект glp, содержащий
        // список категорий и ссылку на WP REST API постов
        wp_localize_script(
            'gutenberg-latest-posts',
            'glp',
            [
            'categories' => $cats,
            'restURL' => esc_url(get_rest_url(null, 'block/v1/latest-posts'))
          ]
        );
    }
}
add_action('enqueue_block_editor_assets', 'blocks_scripts');

function blocks_get_categories()
{
    $categories = get_categories();

    if (!empty($categories)) {
        foreach ($categories as $key => $value) {
            $cats[$value->term_id] = $value->name;
        }
    }

    return $cats;
}
// регистрация нового маршрута
add_action('rest_api_init', 'blocks_rest_endpoint');
function blocks_rest_endpoint()
{
    register_rest_route('block/v1', '/latest-posts', [
      'method' => 'GET',
      'callback' => 'blocks_return_data'
    ]);
}
// формирование ответа от нового маршрута
function blocks_return_data()
{
    $category = isset($_GET['cat']) ? absint($_GET['cat']) : 0;
    $count = isset($_GET['count']) ? absint($_GET['count']) : 0;

    return blocks_get_latest_posts($category, $count);
}

function blocks_get_latest_posts($category, $count)
{
    $result = [];
    $posts = get_posts([
      'numberposts' => $count,
      'category' => $category
    ]);

    foreach ($posts as $key => $value) {
        $result[] = [
          'title' => get_the_title($value->ID),
          'excerpt' => get_the_excerpt($value->ID),
          'link' => get_permalink($value->ID),
          'src' => get_the_post_thumbnail_url($value->ID, 'full'),
          'id'  => $value->ID
        ];
    }

    return $result;
}
// шорткод
add_shortcode('gutenberg-block-latest-posts', 'blocks_shortcode');
function blocks_shortcode($atts)
{
    $atts = shortcode_atts([
      'count' => 5,
      'cat' => array_shift(array_keys(blocks_get_categories())),
      'thumb' => 1
    ], $atts);

    $posts = blocks_get_latest_posts(absint($atts['cat']), absint($atts['count']));

    ob_start(); ?>
    <div class="latest-posts">
      <?php if (!empty($posts)): ?>
        <?php foreach ($posts as $key => $value): ?>
          <div class="post-<?php echo $value['id']; ?> row">
            <?php if ($atts['thumb'] && !empty($value['src'])): ?>
              <div class="thumbnail">
                <img src="<?php echo $value['src'] ?>" alt="<?php echo $value['title'] ?>">
              </div>
            <?php endif; ?>
            <div class="post-content">
              <a href="<?php echo $value['link'] ?>">
                <h2><?php echo $value['title'] ?></h2>
              </a>
              <p><?php echo $value['excerpt'] ?></p>
            </div>
          </div>
        <?php endforeach; ?>
      <?php endif; ?>
    </div>
    <?php
    wp_reset_postdata();

    return ob_get_clean();
}
