/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "react/jsx-runtime":
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["ReactJSXRuntime"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***********************!*\
  !*** ./src/script.js ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);

const {
  createHigherOrderComponent
} = wp.compose;
const {
  Fragment,
  useEffect,
  useState
} = wp.element;
const {
  InspectorControls
} = wp.blockEditor;
const {
  PanelBody,
  ToggleControl,
  PanelRow,
  TextControl,
  SelectControl
} = wp.components;

/**
 * Add additional attributes to core/post-query block.
 */
function addAdditionalAttribute(settings, name) {
  if ('core/query' !== name) {
    return settings;
  }
  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      metaSortEnabled: {
        type: 'boolean',
        default: false
      }
    }
  };
}
wp.hooks.addFilter('blocks.registerBlockType', 'query-block-extension/metadata/sort/add-attributes', addAdditionalAttribute);

/**
 * Add additional controls to core/post-template block.
 */
const withInspectorControls = createHigherOrderComponent(BlockEdit => {
  return props => {
    const {
      name,
      attributes,
      setAttributes
    } = props;
    const {
      metaSortEnabled,
      query
    } = attributes;
    const [metaKeys, setMetaKeys] = useState([]);
    if ('core/query' !== name) {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(BlockEdit, {
        ...props
      });
    }
    useEffect(() => {
      const fetchMetaKeys = async () => {
        const postType = query?.postType || 'post'; // Fallback to 'post'

        const data = new FormData();
        data.append('action', 'metadata_sort_get_meta_keys');
        data.append('nonce', wp_query_block_metadata_sort.nonce);
        data.append('post_type', postType);
        const response = await fetch(ajaxurl, {
          method: 'POST',
          credentials: 'same-origin',
          body: data
        });
        const responseJson = await response.json();
        if (responseJson.success) {
          setMetaKeys(responseJson.data);
        }
      };
      fetchMetaKeys();
    }, [query?.postType]);
    const disableMetaSort = () => {
      const {
        ['metaKey']: remove,
        ...rest
      } = query;
      setAttributes({
        metaSortEnabled: false,
        query: {
          ...rest,
          orderBy: 'date',
          order: 'desc'
        }
      });
    };
    const enableMetaSort = () => {
      setAttributes({
        metaSortEnabled: true,
        query: {
          ...query,
          orderBy: 'meta_value',
          order: 'desc',
          metaKey: metaKeys[0]
        }
      });
    };
    useEffect(() => {
      // If user select one of the default query block orderBy value, then we disable meta sort.
      if (!query.orderBy.startsWith('meta_value') && metaSortEnabled) {
        disableMetaSort();
      }
    }, [query.orderBy]);
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(BlockEdit, {
        ...props
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(InspectorControls, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(PanelBody, {
          title: "Metadata Sort",
          initialOpen: false,
          children: metaKeys.length > 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(Fragment, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(ToggleControl, {
              label: "Enable Metadata Sort",
              checked: metaSortEnabled,
              onChange: newMetaSortEnabled => {
                if (newMetaSortEnabled) {
                  enableMetaSort();
                } else {
                  disableMetaSort();
                }
              }
            }), metaSortEnabled ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(Fragment, {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(SelectControl, {
                label: "Meta Type",
                value: query.metaType ? query.metaType : 'CHAR',
                options: [{
                  label: 'Char',
                  value: 'CHAR'
                }, {
                  label: 'Numeric',
                  value: 'NUMERIC'
                }, {
                  label: 'Binary',
                  value: 'BINARY'
                }, {
                  label: 'Date',
                  value: 'DATE'
                }, {
                  label: 'DateTime',
                  value: 'DATETIME'
                }, {
                  label: 'Decimal',
                  value: 'DECIMAL'
                }, {
                  label: 'Signed',
                  value: 'SIGNED'
                }, {
                  label: 'Time',
                  value: 'TIME'
                }, {
                  label: 'Unsigned',
                  value: 'UNSIGNED'
                }],
                onChange: newType => {
                  setAttributes({
                    query: {
                      ...query,
                      metaType: newType
                    }
                  });
                }
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(SelectControl, {
                label: "Order",
                value: query.order,
                options: [{
                  label: 'DESC',
                  value: 'desc'
                }, {
                  label: 'ASC',
                  value: 'asc'
                }],
                onChange: newOrder => {
                  setAttributes({
                    query: {
                      ...query,
                      order: newOrder
                    }
                  });
                }
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(SelectControl, {
                label: "Meta Key",
                value: query.metaKey,
                options: metaKeys.map(key => {
                  return {
                    label: key,
                    value: key
                  };
                }),
                onChange: newMetaKey => {
                  setAttributes({
                    query: {
                      ...query,
                      metaKey: newMetaKey
                    }
                  });
                },
                __nextHasNoMarginBottom: true
              })]
            }) : null]
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", {
            children: "No post meta key detected on your site"
          })
        })
      })]
    });
  };
}, 'withInspectorControl');
wp.hooks.addFilter('editor.BlockEdit', 'query-block-extension/metadata/sort/add-controls', withInspectorControls);
})();

/******/ })()
;
//# sourceMappingURL=script.js.map