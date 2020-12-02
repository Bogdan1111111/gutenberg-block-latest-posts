(function(blocks, element, i18n, editor, data) {

  const { createElement } = element;
  const { __ } = i18n;
  const { registerBlockType } = blocks;
  const { InspectorControls } = editor;
  const { BlockControls } = editor;

  registerBlockType('block/gutenberg-latest-posts', {
      title: __('Latest Posts'),
      icon: 'dashicons-excerpt-view',
      category: 'common',
      attributes: {
        thumb: {
          type: 'integer',
          default: 1
        },
        count: {
          type: 'integer',
          default: 5
        },
        category: {
          type: 'integer',
          default: Object.keys(data.categories)[0]
        },
        checked: {
          type: 'bool',
          default: true
        },
        posts:  {
          type: 'array',
          default: []
        }
      },
      edit: ({attributes, setAttributes}) => {
        function Item(props) {
          return (
            <div class={ 'row post-' + props.props.id }>
              { (() => {
                if (attributes.thumb && props.props.src.length) {
                  return (
                    <div class="thumbnail">
                      <img src={ props.props.src } alt={ props.props.title }/>
                    </div>
                  );
                }
              })() }
              <div class="post-excerpt">
                <a href={ props.props.link } onClick={ abort }><h3>{ props.props.title }</h3></a>
                <p>{ props.props.excerpt }</p>
              </div>
            </div>
          );
        }
        function setCount(event) {
          setAttributes({count:parseInt(event.target.value)});
          setPosts(attributes.category, event.target.value);
        }
        function setCategory(event) {
          setAttributes({category:parseInt(event.target.value)});
          setPosts(event.target.value, attributes.count);
        }
        function setThumb(event) {
          if (event.target.checked) {
            setAttributes({
              thumb: 1,
              checked: true
            });
          } else {
            setAttributes({
              thumb: 0,
              checked: false
            });
          }
        }
        function abort(event) {
          event.preventDefault();
        }
        function setPosts(category, count) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', data.restURL + '?cat=' + category + '&count=' + count);

          xhr.onload = function () {
            setAttributes({posts:JSON.parse(xhr.responseText)});
          };

          xhr.send();
        }
        return (
          <div className={ attributes.className }>
            <BlockControls>
              <h3>{ __('Latest Posts') }</h3>
            </BlockControls>
            <InspectorControls>
              <p>
                <label>{ __('Posts Count') }</label><br/>
                <input type="number" value={ attributes.count } onChange={ setCount } min="1"/>
              </p>
              <p>
                <label>{ __('Posts Category') }</label><br/>
                  { (() => {
                    let option = Object.keys(data.categories).map((i) => {
                      return (
                        <option value={ i }>{ data.categories[i] }</option>
                      );
                    });
                    return (
                      <select value={ attributes.category } onChange={ setCategory }>
                        { option }
                      </select>
                    )
                  })() }
              </p>
              <p>
                <label>
                  <input type="checkbox" checked={ attributes.checked } onChange={ setThumb }/>
                  { __('Show Thumbnail') }
                </label>
              </p>
            </InspectorControls>
              { (() => {
                if (!attributes.posts.length) {
                  setPosts(attributes.category, attributes.count);
                }
                let items = attributes.posts.map((post) => {
                  return (
                    <Item props={ post }/>
                  );
                });
                return (
                  <div class="preview">
                    { items }
                  </div>
                );
              })() }
          </div>
        );
      },
      save: ({attributes}) => {
        return (
          <div class="latest-posts-block">
            [gutenberg-block-latest-posts cat="{ attributes.category }" count="{ attributes.count }" thumb="{ attributes.thumb }"]
          </div>
        );
      }
  });
})(
  window.wp.blocks,
  window.wp.element,
  window.wp.i18n,
  window.wp.editor,
  window.glp
);
