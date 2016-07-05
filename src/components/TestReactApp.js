'use strict';

var React = require('react/addons');

// CSS
require('normalize.css');
require('../styles/main.scss');

var imageDatas = require('../data/imageDatas.json');

//获取图片路径
imageDatas = (function getImageUrl(imageArr){
  for(let i=0;i<imageArr.length;i++){
    let img = imageArr[i];
    img.imageURL = require('../images/' + img.fileName);
    imageArr[i] = img;
  }
  return imageArr;
})();


var TestReactApp = React.createClass({
  render: function() {
    return (
      <section className="stage">
        <section className="img-sec"></section>
        <nav className="controller-nav"></nav>
      </section>
    );
  }
});
React.render(<TestReactApp />, document.getElementById('content')); // jshint ignore:line

module.exports = TestReactApp;
