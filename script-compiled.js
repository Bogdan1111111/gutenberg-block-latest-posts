(function (blocks, element, i18n, editor, data) {
  var createElement = element.createElement;
  var __ = i18n.__;
  var registerBlockType = blocks.registerBlockType;
  var InspectorControls = editor.InspectorControls;
  var BlockControls = editor.BlockControls;
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
      posts: {
        type: 'array',
        default: []
      }
    },
    edit: function edit(_ref) {
      var attributes = _ref.attributes,
          setAttributes = _ref.setAttributes;

      function Item(props) {
        return createElement("div", {
          class: 'row post-' + props.props.id
        }, function () {
          if (attributes.thumb && props.props.src.length) {
            return createElement("div", {
              class: "thumbnail"
            }, createElement("img", {
              src: props.props.src,
              alt: props.props.title
            }));
          }
        }(), createElement("div", {
          class: "post-excerpt"
        }, createElement("a", {
          href: props.props.link,
          onClick: abort
        }, createElement("h3", null, props.props.title)), createElement("p", null, props.props.excerpt)));
      }

      function setCount(event) {console.log(event.target.value);
        setAttributes({
          count: parseInt(event.target.value)
        });
        setPosts(event.target.value, attributes.category);
      }

      function setCategory(event) {
        setAttributes({
          category: parseInt(event.target.value)
        });
        setPosts(attributes.count,event.target.value);
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

      function setPosts(count,category) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', data.restURL + '?cat=' + category + '&count=' + count);

        xhr.onload = function () {
          setAttributes({
            posts: JSON.parse(xhr.responseText)
          });
        };

        xhr.send();
      }

      return createElement("div", {
        className: attributes.className
      }, createElement(BlockControls, null, createElement("h3", null, __('Latest Posts'))), createElement(InspectorControls, null, createElement("p", null, createElement("label", null, __('Posts Count')), createElement("br", null), createElement("input", {
        type: "number",
        value: attributes.count,
        onChange: setCount,
        min: "1"
      })), createElement("p", null, createElement("label", null, __('Posts Category')), createElement("br", null), function () {
        var option = Object.keys(data.categories).map(function (i) {
          return createElement("option", {
            value: i
          }, data.categories[i]);
        });
        return createElement("select", {
          value: attributes.category,
          onChange: setCategory
        }, option);
      }()), createElement("p", null, createElement("label", null, createElement("input", {
        type: "checkbox",
        checked: attributes.checked,
        onChange: setThumb
      }), __('Show Thumbnail')))), function () {
        if (!attributes.posts.length) {
          setPosts(5,attributes.category);
        }

        var items = attributes.posts.map(function (post) {
          return createElement(Item, {
            props: post
          });
        });
        return createElement("div", {
          class: "preview"
        }, items);
      }());
    },
    save: function save(_ref2) {
      var attributes = _ref2.attributes;
      return createElement("div", {
        class: "latest-posts-block"
      }, "[gutenberg-block-latest-posts cat=\"", attributes.category, "\" count=\"", attributes.count, "\" thumb=\"", attributes.thumb, "\"]");
    }
  });
})(window.wp.blocks, window.wp.element, window.wp.i18n, window.wp.editor, window.glp);
