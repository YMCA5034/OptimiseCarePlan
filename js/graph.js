d3.json("data/citycode.json", function(error, data){
  var citycode = [];
  var cityname = [];
  for (j = 0; j < data.length; j++){
    citycode.push(data[j].code);
    cityname.push(data[j].name);
  }

  var option = d3.select("#cityselect")
  .selectAll("dummy")
  .data(citycode)
  .enter()
  .append("option")
  .text(function(data, i){
    return(cityname[i])
  })
  .attr("value", function(data, i){
    return(citycode[i])
  })
})


//データ読み込み
d3.json("data/industry.json", function(error, data){
  var current_width = $(window).width();
  if (current_width > 1260) {
    $("#mygraph").width(1000)
    $("#mygraph").height(1000 * 0.66)
  } else if(current_width > 768){
    $("#mygraph").width(current_width - 240)
    $("#mygraph").height((current_width -240)* 0.66)
  } else {
    $("#mygraph").width(current_width - 160)
    $("#mygraph").height((current_width -160)* 0.66)
  }
  var citycode = $('#cityselect').val();
  var graphdatap = {};
  var graphdata = [];
  var dataset = {};
  var datamax = 0;
  var yearset = [];
  var maxdataset = [];
  for(i = 1971; i < 2015; i++){
    yearset.push(i);
  }

  function make_dataset(){
    for (j = 0; j < data.length; j++){
      if (data[j]["citycode"] == citycode) {
        dataset[citycode] = data[j];
        for (var key in dataset[citycode]) {
          if(key != "cityname" && key != "citycode"){
            graphdata.push(dataset[citycode][key] * 1)
          }
        }
      }
    }

    graphdatap[citycode] = graphdata;
    for(var key in graphdatap){
      for(var i = 0; i < graphdatap[key].length; i++){
        maxdataset.push(graphdatap[key][i]);
      }
    }
    datamax = d3.max(maxdataset);
  }


  var marginTop = 0;
  var marginLeft = 0;
  var element = document.getElementById("contents")
  var yscale = 0;
  var yscale2 = 0;
  var xscale = 0;
  var datamax = 0;
  //変数の設定
  var svgele = document.getElementById("mygraph");
  var svgwidth = window.getComputedStyle(svgele, null).getPropertyValue("width");
  var svgheight = window.getComputedStyle(svgele, null).getPropertyValue("height");
  svgwidth = parseFloat(svgwidth);
  svgheight = parseFloat(svgheight) - 20;
  var offsetx = 70;
  var offsety = 100;
  var yaxisheight = svgheight - offsety - 20;
  var paddingright = 15;
  var step = (svgwidth - offsetx * 2 - paddingright) / yearset.length;
  var thisx = 0;
  var thisy = 0;

  //ツールチップ設定
  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tip")

  //左縦軸スケール設定
  function calcyscale(){
    yscale = d3.scale.linear()
        .domain([0, datamax*1.1])
        .range([yaxisheight, 0])
    yscale2 = (yaxisheight / (datamax*1.1))
  }






  //折れ線グラフ生成
  function drawline(){
    var line = d3.svg.line()
    .x(function(d, i){
      return offsetx + i * step + step * 0.5;
    })
    .y(function(d, i){
      return svgheight - d * yscale2 - offsety;
    })

    var path = d3.select("#mygraph")
      .append("path")
      .attr("class", "line")
      .attr("id", citycode)
      .attr("d", line(graphdatap[citycode]))
      .style("stroke", function(){
        return "hsl("+((citycode - 13200) * 20 - 20)+", 90%, 50%)";
      })

    var pathlength = path.node().getTotalLength();

    path.attr("stroke-dasharray", pathlength + " " + pathlength)
      .attr("stroke-dashoffset", pathlength)
      .transition()
      .duration(1500)
      .ease("linear")
      .attr("stroke-dashoffset", 0)

  }

  //折れ線ラベル更新
  function updategraph(key){
    d3.select("#mygraph").selectAll(".line")
      .attr("stroke-dasharray", "0")

    var line = d3.svg.line()
    .x(function(d, i){
      return offsetx + i * step + step * 0.5;
    })
    .y(function(d, i){
      return svgheight - d * yscale2 - offsety;
    })

    var selection = document.getElementById(key);
    d3.select(selection)
      .data(graphdatap[key])
      .transition()
      .attr("d", line(graphdatap[key]))

    var selection = document.getElementById(key + "label");
    d3.select(selection)
      .data(graphdatap[key])
      .transition()
      .attr("y", function(){
        return(svgheight - (graphdatap[key][graphdata.length - 1] * yscale2) - offsety);
      })
  }


  //縦軸＆軸ラベル生成
  function drawscale(){
    d3.select("#mygraph")
      .append("g")
      .attr("class", "axis")
      .attr("transform", "translate("+offsetx+", "+((svgheight - yaxisheight) - offsety )+")")
      .call(
        d3.svg.axis()
        .scale(yscale)
        .orient("left")
      )

    //横軸生成
    d3.select("#mygraph")
      .append("rect")
      .attr("class", "axis_x")
      .attr("width", svgwidth - offsetx * 2 - paddingright)
      .attr("height", 0.1)
      .attr("stroke", "grey")
      .attr("transform", "translate("+offsetx+", "+(svgheight - offsety)+")")

    //横軸ラベル生成
    d3.select("#mygraph")
      .selectAll(".t")
      .data(yearset)
      .enter()
      .append("text")
      .attr("class", "haxisname")
      .attr("x", function(d, i){
        return i * step + (step / 2) + offsetx
      })
      .attr("y", svgheight - offsety + 15)
      .text(function(d, i){
        return(yearset[i] + "年");
      })
  }


  //ラベル生成
  function drawlabel(){
    d3.select("#mygraph")
      .append("text")
      .attr("class", "colorlabel")
      .attr("id", citycode + "label")
      .attr("x", function(){
        return svgwidth - offsetx - 10;
      })
      .attr("y", function(){
        return(svgheight - (graphdata[graphdata.length - 1] * yscale2) - offsety);
      })
      .text(function(){
        return dataset[citycode]["cityname"]
      })
      .attr("fill", function(){
        return "hsl("+((citycode - 13200) * 20 - 20)+", 90%, 40%)";
      })
      .attr("opacity", "0")
      .transition()
      .delay(1000)
      .duration(1000)
      .attr("opacity", "1")

  }

  //表作成
  function settable(){
    console.log(dataset)
    var mytablename = document.getElementById("manufacturing_data_name")
    var l = 0
    mytablename.innerText = dataset[citycode].cityname + " （単位：万円）"
    for (var k = 0; k < 5; k++) {
      if(k==4){
        var mytable = document.getElementById("manufacturing_data" + (k + 1))
        for (var i = 0; i < 4; i++){
          mytable.rows[1].cells[i].innerText = Number(dataset[citycode][yearset[l]]).toLocaleString();
          l++
          console.log(l)
        }
      } else {
        var mytable = document.getElementById("manufacturing_data" + (k + 1))
        for (var i = 0; i < 10; i++){
          mytable.rows[1].cells[i].innerText = Number(dataset[citycode][yearset[l]]).toLocaleString();
          l++
          console.log(l)
        }
      }
    }
  }




  make_dataset();
  calcyscale();
  drawlabel();
  drawscale();
  drawline();
  settable();




  //市町村追加
  d3.select("#addbutton")
    .on("click", function(){
      citycode = $('#cityselect').val();
      var test = 0;
      for(var key in graphdatap){
        if(key == citycode){
          test = 1;
        }
      }
      if(test == 0){
        d3.select("#mygraph").selectAll(".axis").remove();
        d3.select("#mygraph").selectAll(".haxisname").remove();
        d3.select("#mygraph").selectAll(".axis_x").remove();

        dataset = {};
        graphdata = [];

        make_dataset();
        calcyscale()
        drawscale()
        for (var key in graphdatap) {
          if(key != citycode){
            updategraph(key);
          }
        }
        drawline();
        drawlabel()
        settable();
      }
    })

  //市町村削除
  d3.select("#deletebutton")
    .on("click", function(){
      citycode = $('#cityselect').val();
      delete graphdatap[citycode];
      var selection = document.getElementById(citycode);
      selection.remove();
      var selection = document.getElementById(citycode + "label");
      selection.remove();
      maxdataset = [];
      for(var key in graphdatap){
        for(var i = 0; i < graphdatap[key].length; i++){
          maxdataset.push(graphdatap[key][i]);
        }
      }
      datamax = d3.max(maxdataset);
      d3.select("#mygraph").selectAll(".axis").remove();
      d3.select("#mygraph").selectAll(".haxisname").remove();
      d3.select("#mygraph").selectAll(".axis_x").remove();
      calcyscale()
      drawscale()
      for (var key in graphdatap) {
        updategraph(key);
      }
    })

  //市町村オール削除
  d3.select("#alldeletebutton")
    .on("click", function(){
      d3.select("#mygraph").selectAll(".line").remove();
      d3.select("#mygraph").selectAll(".label").remove();
      maxdataset = [];
      graphdatap = {};
    })

})
