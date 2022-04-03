const path = require('path');

module.exports = (env) => ({
  entry: './demo/demo.ts',
  mode: env.production ? "production" : "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  target: "es5",
  output: {
    filename: 'demo.js',
    path: path.resolve(__dirname, 'dist'),
  },
});