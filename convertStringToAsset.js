/**
 * Creates a webpack asset from a string that can be added to a compilation.
 *
 * @param {string} assetAsString String representation of the asset that should
 * be written to the file system by webpack.
 * @return {WebpackAsset}
 *
 * @private
 */
function convertStringToAsset(assetAsString) {
    return {
      source: function source() {
        return assetAsString;
      },
      size: function size() {
        return assetAsString.length;
      }
    };
  }
  
  module.exports = convertStringToAsset;