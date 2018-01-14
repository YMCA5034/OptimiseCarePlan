var current_height = $(window).height();
$("#map").height(current_height*0.8)

var base = new L.TileLayer("http://www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png", {
      attribution: "map data © OpenStreetMap contributors CC BY-SA2.0",
      maxZoom: 14,
      minZoom: 8
});

var map = new L.Map('map', {layers: [base], center: new L.LatLng(35.7000, 139.430), zoom: 10});
L.svg().addTo(map)
var svg = d3.select("#map").select("svg");
var g = svg.select("g");
var mapwidth = $("#map").width()
var mapheight = $("#map").height()
var rootdata = {}


var loaddata = function(){

  var featureElement
  var zoomlevel = map.getZoom()
  var threshold = [9,10,11]
  var datamax
  var datamin
  var citycode = $('#cityselect').val();
  var contentscode = $('#contentsselect').val();
  var methodvalue = $("input[name=method]").val();
  var citycode = $('#cityselect').val();
  var contentscode = $('#contentsselect').val();
  var methodvalue = $("input[name=method]").val();
  var mapdata = {}
  var mapdataa = []
  var graphdata = []
  var graphdata2 = []
  var graphdata_value = []
  var datevalue = new Date(2017,11,19);
  var min_xscale = new Date(2017,10,1)*1
  var max_xscale = Date.now()*1
  var yscale = 0;
  var yscale2 = 0;
  var xscale = 0;
  var svgele = document.getElementById("mygraph");
  var svgwidth = window.getComputedStyle(svgele, null).getPropertyValue("width");
  var svgheight = window.getComputedStyle(svgele, null).getPropertyValue("height");
  svgwidth = parseFloat(svgwidth);
  svgheight = parseFloat(svgheight) - 20;
  var offsetx = 40//svgwidth * 0.08;
  var offsety = 60//svgheight * 0.15;
  var padding_right = 30
  var yaxisheight = svgheight - offsety - 20;
  var selectflag = "day"

  //---selectboxの設定 start---
  function setselectbox(){
    d3.json("data/citycode_ittonanaken_ver0.json", function(error, codename){
      // console.log(codename)
      var prefecturevalue = $('#prefectureselect').val()*1;
      var citynamearray = []
      var citycodearray = []
      $('#cityselect').children().remove();
      for(i = 0; i < codename[prefecturevalue].length; i++){
          citycodearray.push(codename[prefecturevalue][i].citycode)
          citynamearray.push(codename[prefecturevalue][i].cityname)
      }
      var option = d3.select("#cityselect")
      .selectAll("option")
      .data(citycodearray)
      .enter()
      .append("option")
      .text(function(d, i){
        return(citynamearray[i])
      })
      .attr("value", function(d, i){
        return(citycodearray[i])
      })
    })
  }
  //---selectboxの設定 end---
  setselectbox()

  d3.json("data/cif.json", function(error, cifd){
    d3.json("data/log.json", function(error, logd){
      d3.json("data/kaigo.json", function(error, kaigod){
        rootdata = {cif: cifd, log: logd, kaigo: kaigod}
        var transform = d3.geo.transform({point: projectPoint});
        var path = d3.geo.path().projection(transform);
        var updatePosition = function(d){
          d.pos = map.latLngToLayerPoint(new L.LatLng(d.latitude, d.longitude));
          d3.select(this).attr( {cx: d.pos.x, cy: d.pos.y } );
        }
        var circlesize = 5
        svg.append("g")
          .attr("class", "circle_kaigo_g")
          .selectAll(".dummy")
          .data(rootdata.kaigo)
          .enter()
          .append("circle")
          .attr("class", "kaigo_circle")
          // .attr("name", function(d, i){
          //   return d.properties.S12_003 + "_" +d.properties.S12_001
          // })
          .attr("fill","orange")
          .attr("r", function(d, i){
            return (circlesize) + "px"
          })
          .each(update_circle)
          .on("mouseover", function(){
              var thisdata = this
              d3.select("#map")
                .append("div")
                .attr("class", "map_fukidashi")
              $(".map_fukidashi").textWithLF(function(){
                var output = thisdata.__data__.name + "\n"
                  + thisdata.__data__.address
                return output;
              })
              .attr("style", function(){
                var f_width = $(".map_fukidashi").outerWidth()
                var f_height = $(".map_fukidashi").outerHeight()
                return ("left:" + (thisdata.cx.baseVal.value + d3.select(".leaflet-map-pane")[0]["0"]._leaflet_pos.x - f_width * 0.5 + 3) + "px;" +
                  "top:" + (thisdata.cy.baseVal.value + d3.select(".leaflet-map-pane")[0]["0"]._leaflet_pos.y - f_height - 12) + "px;")
              })
            })
        var zoomlevel = 10
        console.log(zoomlevel)
        drawmap(rootdata)

        function drawmap(data){
          // svg.append("g")
          //   .attr("class", "circle_buffer_g")
          //   .selectAll(".dummy")
          //   .data(data.cif)
          //   .enter()
          //   .append("circle")
          //   .attr("class", "buffer_circle")
          //   // .attr("name", function(d, i){
          //   //   return d.properties.S12_003 + "_" +d.properties.S12_001
          //   // })
          //   //.attr("display", "none")
          //   .attr("stroke", "grey")
          //   .attr("fill","none")
          //   .attr("r", function(d, i){
          //     return (circlesize + zoomlevel*zoomlevel * 54 /100) + "px"
          //   })
          //   .each(update_circle)

          svg.append("g")
            .attr("class", "circle_g")
            .selectAll(".dummy")
            .data(data.cif)
            .enter()
            .append("circle")
            .attr("class", "station_circle")
            // .attr("name", function(d, i){
            //   return d.properties.S12_003 + "_" +d.properties.S12_001
            // })
            .attr("fill","#2f5597")
            .attr("r", function(d, i){
              return (circlesize + 5) + "px"
            })
            .each(update_circle)
            .on("mouseover", function(){
                var thisdata = this
                d3.select("#map")
                  .append("div")
                  .attr("class", "map_fukidashi")
                $(".map_fukidashi").textWithLF(function(){
                  var output = thisdata.__data__.name + "\n"
                    + "id: " + thisdata.__data__.id + "\n"
                    + thisdata.__data__.age +"歳 " + thisdata.__data__.sex +"性\n"
                    + "要介護度: " + thisdata.__data__.cat1 + thisdata.__data__.cat2
                  return output;
                })
                .attr("style", function(){
                  var f_width = $(".map_fukidashi").outerWidth()
                  var f_height = $(".map_fukidashi").outerHeight()
                  return ("left:" + (thisdata.cx.baseVal.value + d3.select(".leaflet-map-pane")[0]["0"]._leaflet_pos.x - f_width * 0.5 + 3) + "px;" +
                    "top:" + (thisdata.cy.baseVal.value + d3.select(".leaflet-map-pane")[0]["0"]._leaflet_pos.y - f_height - 12) + "px;")
                })
              })
              .on("mouseout", function(){
                d3.selectAll(".map_fukidashi")
                  .remove()
              })
              .on("click", function(){
                graphdata = []
                graphdata2 = []
                graphdata_value = []
                var id = this.__data__.id
                for(i = 0; i < data.log.length; i++){
                  if(data.log[i].id == id){
                    graphdata.push(data.log[i])
                  }
                }
                for(i = 0; i < graphdata.length; i++){
                  var datevalue = new Date(graphdata[i].time)
                  var datevalue2
                  var datavalue3
                  if(selectflag == "time"){
                    datevalue2 = datevalue.getFullYear() + "_" + datevalue.getMonth()+"_"+ datevalue.getDate()+"_"+datevalue.getHours()
                    datevalue3 = new Date(datevalue.getFullYear(), datevalue.getMonth(), datevalue.getDate(), datevalue.getHours())
                  }else if (selectflag == "day") {
                    datevalue2 = datevalue.getFullYear() + "_" + datevalue.getMonth()+"_"+ datevalue.getDate()
                    datevalue3 = new Date(datevalue.getFullYear(), datevalue.getMonth(), datevalue.getDate())
                  }else{
                    datevalue2 = datevalue.getFullYear() + "_" + datevalue.getMonth()
                    datevalue3 = new Date(datevalue.getFullYear(), datevalue.getMonth())
                  }
                  graphdata[i].timevalue = datevalue2
                  graphdata[i].timevalue2 = datevalue3
                }
                graphdata2.push(graphdata[0])
                var k = 0
                for(i = 1; i < graphdata.length; i++){
                  for(j = k; j < graphdata2.length; j++){
                    if(graphdata[i].timevalue == graphdata2[j].timevalue){
                      graphdata2[j].value = graphdata2[j].value + graphdata[i].value
                    }else{
                      graphdata2.push(graphdata[i])
                      k = k + 1
                    }
                  }
                }
                for(i =0; i < graphdata2.length; i++){
                  graphdata_value.push(graphdata2[i].value)
                }
                datamax = d3.max(graphdata_value);
                datamin = d3.min(graphdata_value);
                console.log(graphdata_value,datamax, datamin)
                calcyscale()
                drawgraph(graphdata2)
                drawscale()

                updatetable(this.__data__)
              })

          map.on('move', function(d){
            zoomlevel = map._animateToZoom
            svg.selectAll(".station_circle").each(update_circle)
            svg.selectAll(".kaigo_circle").each(update_circle)
            svg.selectAll(".buffer_circle").each(update_circle_buffer)
          })
        }

        function updatetable(data){
          d3.select("#name_area")
            .text("お名前: " + data.name + " さん")
          d3.select("#koritsu_value_area")
            .text("孤立指数: " +data.koritsu_value + " ポイント")
          d3.select("#jusho_area")
            .text("住所: " + data.prefecturename)
          d3.select("#age_sex_area")
            .text("年齢: " + data.age + " 歳  性別: "+ data.sex)
          d3.select("#youkaigo_area")
            .text("要介護度:" + data.cat1 + " " + data.cat2)
        }

        function update_circle(d){
          d.pos = map.latLngToLayerPoint(new L.LatLng(d.lat*1, d.lng*1));
          d3.select(this)
            .attr("cx", d.pos.x)
            .attr("cy", d.pos.y)
        }
        // function update_circle_buffer(d){
        //   d.pos = map.latLngToLayerPoint(new L.LatLng(d.lat*1, d.lng*1));
        //   d3.select(this)
        //     .attr("cx", d.pos.x)
        //     .attr("cy", d.pos.y)
        //     .attr("r", function(d, i){
        //       return (circlesize + 54 / 100 / 1/zoomlevel^2) + "px"
        //     })
        // }
        function projectPoint(x, y){
          var point = map.latLngToLayerPoint(new L.LatLng(y, x));
          this.stream.point(point.x, point.y);
        }
        //縦軸スケール設定
        function calcyscale(){
          yscale = d3.scale.linear()
              .domain([0, datamax])
              .range([yaxisheight, 0])
          yscale2 = (yaxisheight / (datamax))


          xscale = d3.time.scale()
            .domain([min_xscale, max_xscale])
            .range([0, svgwidth - offsetx - padding_right])
          xscale2 = (svgwidth - offsetx - padding_right)/(max_xscale - min_xscale)
          console.log(yaxisheight,yscale2,xscale2)
        }
        function drawgraph(data){
          d3.select(".bar").remove()
          d3.select("#mygraph")
            .append("g")
            .attr("class", "bar")
            .selectAll("dummy")
            .data(data)
            .enter()
            .append("rect")
            .attr("width", (svgwidth - offsetx - padding_right) / 30)
            .attr("height", "0")
            .attr("x", function(d,i){
              return d.timevalue2.getDate() * (svgwidth - offsetx - padding_right) / 30 + offsetx
            })
            .attr("y", svgheight - offsety)
            .transition()
            .duration(1000)
            .attr("height", function(d,i){
              return d.value * yscale2
            })
            .attr("y", function(d,i){
              return svgheight - offsety - d.value * yscale2
            })
        }

        //バッファーボタンプッシュ
        var bufferflag = 1
        d3.select("#bufferbutton")
          .on("click", function(){
            if(bufferflag == 1){
              d3.selectAll(".buffer_circle")
                .attr("display", "block")
              bufferflag = 0
            }else {
              d3.selectAll(".buffer_circle")
                .attr("display", "none")
              bufferflag = 1
            }
          })

        //時間ボタンプッシュ
        d3.select("#timebutton")
          .on("click", function(){
            console.log(graphdata)
            selectflag = "time"
            console.log(selectflag)
            graphdata[i].timevalue = 0
            graphdata[i].timevalue2 = 0
            graphdata2 = []
            graphdata_value = []
            for(i = 0; i < graphdata.length; i++){
              var datevalue = new Date(graphdata[i].time)
              var datevalue2 = 0
              var datavalue3 = 0
              if(selectflag == "time"){
                datevalue2 = datevalue.getFullYear() + "_" + datevalue.getMonth()+"_"+ datevalue.getDate()+"_"+datevalue.getHours()
                datevalue3 = new Date(datevalue.getFullYear(), datevalue.getMonth(), datevalue.getDate(), datevalue.getHours())
              }else if (selectflag == "day") {
                datevalue2 = datevalue.getFullYear() + "_" + datevalue.getMonth()+"_"+ datevalue.getDate()
                datevalue3 = new Date(datevalue.getFullYear(), datevalue.getMonth(), datevalue.getDate())
              }else{
                datevalue2 = datevalue.getFullYear() + "_" + datevalue.getMonth()
                datevalue3 = new Date(datevalue.getFullYear(), datevalue.getMonth())
              }
              graphdata[i].timevalue = datevalue2
              graphdata[i].timevalue2 = datevalue3
            }
            graphdata2.push(graphdata[0])
            var k = 0
            for(i = 1; i < graphdata.length; i++){
              for(j = k; j < graphdata2.length; j++){
                if(graphdata[i].timevalue == graphdata2[j].timevalue){
                  graphdata2[j].value = graphdata2[j].value + graphdata[i].value
                }else{
                  graphdata2.push(graphdata[i])
                  k = k + 1
                }
              }
            }
            for(i =0; i < graphdata2.length; i++){
              graphdata_value.push(graphdata2[i].value)
            }
            datamax = d3.max(graphdata_value);
            datamin = d3.min(graphdata_value);
            console.log(graphdata_value,datamax, datamin)
            calcyscale()
            drawgraph(graphdata2)
            drawscale()
        })

        //日ボタンプッシュ
        d3.select("#daybutton")
          .on("click", function(){
            selectflag = "day"
            console.log(selectflag)
            graphdata[i].timevalue = 0
            graphdata[i].timevalue2 = 0
            graphdata2 = []
            graphdata_value = []
            for(i = 0; i < graphdata.length; i++){
              var datevalue = new Date(graphdata[i].time)
              var datevalue2 = 0
              var datavalue3 = 0
              if(selectflag == "time"){
                datevalue2 = datevalue.getFullYear() + "_" + datevalue.getMonth()+"_"+ datevalue.getDate()+"_"+datevalue.getHours()
                datevalue3 = new Date(datevalue.getFullYear(), datevalue.getMonth(), datevalue.getDate(), datevalue.getHours())
              }else if (selectflag == "day") {
                datevalue2 = datevalue.getFullYear() + "_" + datevalue.getMonth()+"_"+ datevalue.getDate()
                datevalue3 = new Date(datevalue.getFullYear(), datevalue.getMonth(), datevalue.getDate())
              }else{
                datevalue2 = datevalue.getFullYear() + "_" + datevalue.getMonth()
                datevalue3 = new Date(datevalue.getFullYear(), datevalue.getMonth())
              }
              graphdata[i].timevalue = datevalue2
              graphdata[i].timevalue2 = datevalue3
            }
            graphdata2.push(graphdata[0])
            var k = 0
            for(i = 1; i < graphdata.length; i++){
              for(j = k; j < graphdata2.length; j++){
                if(graphdata[i].timevalue == graphdata2[j].timevalue){
                  graphdata2[j].value = graphdata2[j].value + graphdata[i].value
                }else{
                  graphdata2.push(graphdata[i])
                  k = k + 1
                }
              }
            }
            for(i =0; i < graphdata2.length; i++){
              graphdata_value.push(graphdata2[i].value)
            }
            datamax = d3.max(graphdata_value);
            datamin = d3.min(graphdata_value);
            console.log(graphdata_value,datamax, datamin)
            calcyscale()
            drawgraph(graphdata2)
            drawscale()
          })

        //月ボタンプッシュ
        d3.select("#monthbutton")
          .on("click", function(){
            selectflag = "month"
            console.log(selectflag)
            graphdata[i].timevalue = 0
            graphdata[i].timevalue2 = 0
            graphdata2 = []
            graphdata_value = []
            for(i = 0; i < graphdata.length; i++){
              var datevalue = new Date(graphdata[i].time)
              var datevalue2 = 0
              var datavalue3 = 0
              if(selectflag == "time"){
                datevalue2 = datevalue.getFullYear() + "_" + datevalue.getMonth()+"_"+ datevalue.getDate()+"_"+datevalue.getHours()
                datevalue3 = new Date(datevalue.getFullYear(), datevalue.getMonth(), datevalue.getDate(), datevalue.getHours())
              }else if (selectflag == "day") {
                datevalue2 = datevalue.getFullYear() + "_" + datevalue.getMonth()+"_"+ datevalue.getDate()
                datevalue3 = new Date(datevalue.getFullYear(), datevalue.getMonth(), datevalue.getDate())
              }else{
                datevalue2 = datevalue.getFullYear() + "_" + datevalue.getMonth()
                datevalue3 = new Date(datevalue.getFullYear(), datevalue.getMonth())
              }
              graphdata[i].timevalue = datevalue2
              graphdata[i].timevalue2 = datevalue3
            }
            graphdata2.push(graphdata[0])
            var k = 0
            for(i = 1; i < graphdata.length; i++){
              for(j = k; j < graphdata2.length; j++){
                if(graphdata[i].timevalue == graphdata2[j].timevalue){
                  graphdata2[j].value = graphdata2[j].value + graphdata[i].value
                }else{
                  graphdata2.push(graphdata[i])
                  k = k + 1
                }
              }
            }
            for(i =0; i < graphdata2.length; i++){
              graphdata_value.push(graphdata2[i].value)
            }
            datamax = d3.max(graphdata_value);
            datamin = d3.min(graphdata_value);
            console.log(graphdata_value,datamax, datamin)
            calcyscale()
            drawgraph(graphdata2)
            drawscale()
          })

        //縦軸＆軸ラベル生成
        function drawscale(){
          d3.select(".axis").remove()
          d3.select(".axis_x").remove()
          d3.select("#mygraph")
            .append("g")
            .attr("class", "axis")
            .attr("transform", "translate("+offsetx+", "+((svgheight - yaxisheight) - offsety )+")")
            .call(
              d3.svg.axis()
              .scale(yscale)
              .orient("left")
            )

          d3.select("#mygraph")
            .append("g")
            .attr("class", "axis_x")
            .attr("transform", "translate("+offsetx+", "+(svgheight - offsety )+")")
            .call(
                d3.svg.axis()
                .scale(xscale)
                .orient("bottom")
                .tickFormat(function(d){
                  if(selectflag == "time"){
                    return d3.time.format("%H時")(d)
                  }else if(selectflag == "day"){
                    return d3.time.format("%m月%d日")(d)
                  }else{
                    return d3.time.format("%y年%m月")(d)
                  }
                })
              )
            .selectAll("text")
            .style("text-anchor", "end")
        }
      })
    })
  })
//
//   //データ読み込み
//   var APP_ID = "xGnaAy8zDWeeBwYoVaWOkax7CuzNLIpPOHswzxRo"
//   var API_URL = "https://opendata.resas-portal.go.jp/api/v1/partner/docomo/destination"
//   var Year = "2015"
//   var Month = "10"
//
//   d3.json("data/ittonanaken.json", function(error, mapd){
//     d3.json("data/city_name_ittonanaken.geojson", function(error, labeld){
//       rootdata = {map: mapd, label: labeld}
//       for(var i =0; i < rootdata.map.features.length; i++){
//         rootdata.map.features[i].properties.datavalue = 0
//       }
//
//       var PeriodOfDay = $('#weekdayselect').val();
//       var PeriodOfTime= $('#timeselect').val();
//       var Gender = $('#sexselect').val();
//       var AgeRange = $('#ageselect').val();
//       var PrefCodeDestination = $('#prefectureselect').val();
//       var CityCodeDestination = $('#cityselect').val();
//       var PrefCodeResidence = "-"
//       var CityCodeResidence = "-"
//       var GET_URL = API_URL;
//       GET_URL += "?year=" + escape(Year);
//       GET_URL += "&month=" + escape(Month);
//       GET_URL += "&periodOfDay=" + escape(PeriodOfDay);
//       GET_URL += "&periodOfTime=" + escape(PeriodOfTime);
//       GET_URL += "&gender=" + escape(Gender);
//       GET_URL += "&ageRange=" + escape(AgeRange);
//       GET_URL += "&prefCodeDestination=" + escape(PrefCodeDestination);
//       GET_URL += "&cityCodeDestination=" + escape(CityCodeDestination);
//       GET_URL += "&prefCodeResidence=" + escape(PrefCodeResidence);
//       GET_URL += "&cityCodeResidence=" + escape(CityCodeResidence);
//
//       makedataset(rootdata)
//
//       //都道府県セレクト変化
//       d3.select("#prefectureselect")
//         .on("change", function(){
//           setselectbox();
//       })
//
//       //市町村セレクト変化
//       d3.select("#cityselect")
//         .on("change", function(){
//           svg.selectAll(".value_label").remove();
//           updatedataset(rootdata)
//       })
//       //性別セレクト変化
//       d3.select("#sexselect")
//         .on("change", function(){
//           svg.selectAll(".value_label").remove();
//           updatedataset(rootdata)
//       })
//       //年齢セレクト変化
//       d3.select("#ageselect")
//         .on("change", function(){
//           svg.selectAll(".value_label").remove();
//           updatedataset(rootdata)
//       })
//       //時間帯セレクト変化
//       d3.select("#timeselect")
//         .on("change", function(){
//           svg.selectAll(".value_label").remove();
//           updatedataset(rootdata)
//       })
//       //平日・休日セレクト変化
//       d3.select("#weekdayselect")
//         .on("change", function(){
//           svg.selectAll(".value_label").remove();
//           updatedataset(rootdata)
//       })
//       //ラジオボタン変化
//       d3.selectAll("input")
//         .on("change", function(){
//           svg.selectAll(".value_label").remove();
//           updatedataset(rootdata);
//       })
//
//
//
//
//       function makedataset(data){
//         $.ajax({
//           url: GET_URL,
//           type: "GET",
//           headers: {
//             'X-API-KEY': APP_ID
//           },
//           async: "false",
//           success: function(apid) {
//             // $("#loading").fadeOut();
//             rootdata["api"] = apid.result
//             mapdata = {}
//             mapdataa = []
//
//             for(var i = 0; i < data.api.prefs.length; i++){
//               for(var j = 0; j < data["api"]["prefs"][i]["cities"].length; j++){
//                 mapdata[data["api"]["prefs"][i]["cities"][j]["cityCode"]*1] = data["api"]["prefs"][i]["cities"][j]["total"]
//               }
//             }
//             console.log(mapdata)
//
//             for(var key in mapdata){
//               var temp = mapdata[key] / data.api.total
//               mapdataa.push(temp)
//               for(j = 0; j < data.map.features.length; j++){
//                 if(data.map.features[j].properties.N03_007 == key){
//                   data.map.features[j].properties["datavalue"] = temp
//                   break;
//                 }
//               }
//             }
//             datamax = Math.max.apply(null, mapdataa);
//             datamin = Math.min.apply(null, mapdataa);
//             console.log(data)
//
//             drawmap(rootdata)
//           }
//         })
//
//
//
//         function drawmap(data){
//           var hue = [];
//           var hue2 = [];
//           for (var i = 0; i < data.map.features.length; i++) {
//             if(data.map.features[i].properties.datavalue < 0.001){
//               hue.push(100)
//               hue2.push(100)
//             } else if (data.map.features[i].properties.datavalue < 0.01) {
//               hue.push(90)
//               hue2.push(70)
//             } else if (data.map.features[i].properties.datavalue < 0.02) {
//               hue.push(80)
//               hue2.push(70)
//             } else if (data.map.features[i].properties.datavalue < 0.03) {
//               hue.push(70)
//               hue2.push(70)
//             } else if (data.map.features[i].properties.datavalue < 0.04) {
//               hue.push(60)
//               hue2.push(70)
//             } else if (data.map.features[i].properties.datavalue < 0.05) {
//               hue.push(50)
//               hue2.push(70)
//             } else if (data.map.features[i].properties.datavalue < 0.1) {
//               hue.push(40)
//               hue2.push(70)
//             } else if (data.map.features[i].properties.datavalue < 0.15) {
//               hue.push(30)
//               hue2.push(70)
//             } else {
//               hue.push(20)
//               hue2.push(70)
//             }
//           }
//           // console.log(hue)
//           //地図作成
//           var transform = d3.geo.transform({point: projectPoint});
//           var path = d3.geo.path().projection(transform);
//           var updatePosition = function(d){
//             d.pos = map.latLngToLayerPoint(new L.LatLng(d.latitude, d.longitude));
//             d3.select(this).attr( {cx: d.pos.x, cy: d.pos.y } );
//           }
//
//           featureElement = g.selectAll("path")
//             .data(data.map.features)
//             .enter()
//             .append("path")
//             .style("fill", function(d1, i){
//               return "hsl("+hue[i]+", 90%, 100%)";
//             })
//             .style("opacity", function(d1, i){
//               if (hue2[i] == 100) {
//                 return 0
//               } else {
//                 return 0.5
//               }
//             })
//             .transition()
//             .duration(1300)
//             .style("fill", function(d1, i){
//               return "hsl("+hue[i]+", 90%, "+hue2[i]+")";
//             })
//             .each(update)
//
//
//           //市町村名&ラベル作成
//           svg.append("g")
//             .attr("class", "cityname_label")
//             .selectAll("dummy")
//             .data(data.label.features)
//             .enter()
//             .append("text")
//             .text(function(d,i){
//               return d.properties.N03_002
//             })
//             .attr("dy", "-0.6em")
//             .each(update_label)
//
//           svg.append("g")
//             .attr("class", "value_label")
//             .selectAll("dummy")
//             .data(data.label.features)
//             .enter()
//             .append("text")
//             .text(function(d,i){
//               var citycode_tip = d.properties.N03_007
//               methodvalue = $("input[name=method]:checked").val();
//               if(methodvalue == 0){
//                 for (j = 0; j < data.map.features.length; j++) {
//                   if (data.map.features[j].properties.N03_007 == citycode_tip) {
//                     return d3.format(".1%")(data.map.features[j].properties.datavalue)
//                   }
//                 }
//               } else {
//                 for(var key in mapdata){
//                   if(key == citycode_tip){
//                     return d3.format(",")(mapdata[key])
//                   }
//                 }
//               }
//             })
//             .attr("dy", "0.6em")
//             .each(update_label)
//
//           map.on('move', function(d){
//             g.selectAll("path").each(update);
//             svg.selectAll(".value_label text").each(update_label)
//             svg.selectAll(".cityname_label text").each(update_label)
//             var mapcenter = map.getCenter()
//             var point = map.latLngToLayerPoint(mapcenter)
//             svg.select(".legendQuant").attr("transform", "translate("+ (point.x - mapwidth / 2 + mapwidth*0.05) + ", " + (point.y + mapheight*0.15) + ")")
//
//             zoomlevel = map.getZoom()
//             if(zoomlevel > threshold[2]){
//               d3.selectAll(".cityname_label text")
//                 .attr("opacity", 1)
//                 .attr("font-size", "1.2vw")
//               d3.selectAll(".value_label text")
//                 .attr("opacity", 1)
//                 .attr("font-size", "1.2vw")
//             } else if(zoomlevel > threshold[1]){
//               d3.selectAll(".cityname_label text")
//                 .attr("opacity", 1)
//                 .attr("font-size", "1vw")
//               d3.selectAll(".value_label text")
//                 .attr("opacity", 1)
//                 .attr("font-size", "1vw")
//             } else if(zoomlevel > threshold[0]){
//               d3.selectAll(".cityname_label text")
//                 .attr("opacity", 1)
//                 .attr("font-size", "0.8vw")
//               d3.selectAll(".value_label text")
//                 .attr("opacity", 1)
//                 .attr("font-size", "0.8vw")
//             } else {
//               d3.selectAll(".cityname_label text")
//                 .attr("opacity", 0)
//               d3.selectAll(".value_label text")
//                 .attr("opacity", 0)
//             }
//           });
//
//           function update(d){
//             d3.select(this).attr("d", path)
//           }
//           function update_label(d){
//             d.pos = map.latLngToLayerPoint(new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0]));
//             d3.select(this).attr("transform", "translate(" +d.pos.x+ ", "+d.pos.y+")")
//           }
//           function projectPoint(x, y){
//             var point = map.latLngToLayerPoint(new L.LatLng(y, x));
//             this.stream.point(point.x, point.y);
//           }
//
//
//           //凡例作成
//           var notesname = []
//           var colorScale = d3.scale.linear()
//            .domain([0.15, 0.1, 0.05, 0.04, 0.03, 0.02, 0.01, 0.001, 0])
//            .range(["hsl(20, 90, 70)", "hsl(30, 90, 70)", "hsl(40, 90, 70)", "hsl(50, 90, 70)", "hsl(60, 90, 70)",
//             "hsl(70, 90, 70)", "hsl(80, 90, 70)", "hsl(90, 90, 70)", "hsl(100, 90, 100)"])
//
//            //凡例を配置するグループ要素を追加
//           var mapcenter = map.getCenter()
//           var point = map.latLngToLayerPoint(mapcenter)
//           var legendView = svg
//             .append("g")
//             .attr("class", "legendQuant")
//             .attr("transform", "translate("+ (point.x - mapwidth / 2 + mapwidth*0.05) + ", " + (point.y + mapheight*0.15) + ")")
//
//             //スケールを元に凡例を生成する
//           var legend = d3.legend.color()
//             .cells([0.15, 0.1, 0.05, 0.04, 0.03, 0.02, 0.01, 0.001, 0])
//             .shapeWidth(mapheight / 30)
//             .shapeHeight(mapheight / 35)
//             .labelFormat(d3.format(".1%"))
//             .scale(colorScale);
//
//           //凡例を描画する
//           legendView.call(legend);
//         } //function drawmap end
//       } //function makedataset end
//
//       function updatedataset(data){
//         for(var i =0; i < rootdata.map.features.length; i++){
//           rootdata.map.features[i].properties.datavalue = 0
//         }
//         var PeriodOfDay = $('#weekdayselect').val();
//         var PeriodOfTime= $('#timeselect').val();
//         var Gender = $('#sexselect').val();
//         var AgeRange = $('#ageselect').val();
//         var PrefCodeDestination = $('#prefectureselect').val();
//         var CityCodeDestination = $('#cityselect').val();
//         var PrefCodeResidence = "-"
//         var CityCodeResidence = "-"
//         var GET_URL = API_URL;
//         GET_URL += "?year=" + escape(Year);
//         GET_URL += "&month=" + escape(Month);
//         GET_URL += "&periodOfDay=" + escape(PeriodOfDay);
//         GET_URL += "&periodOfTime=" + escape(PeriodOfTime);
//         GET_URL += "&gender=" + escape(Gender);
//         GET_URL += "&ageRange=" + escape(AgeRange);
//         GET_URL += "&prefCodeDestination=" + escape(PrefCodeDestination);
//         GET_URL += "&cityCodeDestination=" + escape(CityCodeDestination);
//         GET_URL += "&prefCodeResidence=" + escape(PrefCodeResidence);
//         GET_URL += "&cityCodeResidence=" + escape(CityCodeResidence);
//         $.ajax({
//           url: GET_URL,
//           type: "GET",
//           headers: {
//             'X-API-KEY': APP_ID
//           },
//           async: "false",
//           success: function(apid) {
//             console.log(apid)
//             rootdata["api"] = apid.result
//             mapdata = {}
//             mapdataa = []
//
//             for(var i = 0; i < data.api.prefs.length; i++){
//               for(var j = 0; j < data["api"]["prefs"][i]["cities"].length; j++){
//                 mapdata[data["api"]["prefs"][i]["cities"][j]["cityCode"]*1] = data["api"]["prefs"][i]["cities"][j]["total"]
//               }
//             }
//             console.log(mapdata)
//
//             for(var key in mapdata){
//               var temp = mapdata[key] / data.api.total
//               mapdataa.push(temp)
//               for(j = 0; j < data.map.features.length; j++){
//                 if(data.map.features[j].properties.N03_007 == key){
//                   data.map.features[j].properties["datavalue"] = temp
//                   break;
//                 }
//               }
//             }
//             datamax = Math.max.apply(null, mapdataa);
//             datamin = Math.min.apply(null, mapdataa);
//             console.log(data)
//
//             updatemap(rootdata)
//
//             //ラジオボタン変化
//             d3.selectAll("input")
//               .on("change", function(){
//                 svg.selectAll(".value_label").remove();
//                 updatemap(rootdata);
//             })
//           }
//         })
//
//
//
//         function updatemap(data){
//           var hue = [];
//           var hue2 = [];
//           for (var i = 0; i < data.map.features.length; i++) {
//             if(data.map.features[i].properties.datavalue < 0.001){
//               hue.push(100)
//               hue2.push(100)
//             } else if (data.map.features[i].properties.datavalue < 0.01) {
//               hue.push(90)
//               hue2.push(70)
//             } else if (data.map.features[i].properties.datavalue < 0.02) {
//               hue.push(80)
//               hue2.push(70)
//             } else if (data.map.features[i].properties.datavalue < 0.03) {
//               hue.push(70)
//               hue2.push(70)
//             } else if (data.map.features[i].properties.datavalue < 0.04) {
//               hue.push(60)
//               hue2.push(70)
//             } else if (data.map.features[i].properties.datavalue < 0.05) {
//               hue.push(50)
//               hue2.push(70)
//             } else if (data.map.features[i].properties.datavalue < 0.1) {
//               hue.push(40)
//               hue2.push(70)
//             } else if (data.map.features[i].properties.datavalue < 0.15) {
//               hue.push(30)
//               hue2.push(70)
//             } else {
//               hue.push(20)
//               hue2.push(70)
//             }
//           }
//           // console.log(hue)
//           //地図作成
//           svg.selectAll("path")
//             .data(data.map.features)
//             .transition()
//             .duration(1300)
//             .style("fill", function(d1, i){
//               return "hsl("+hue[i]+", 90%, "+hue2[i]+")";
//             })
//             .style("opacity", function(d1, i){
//               if (hue2[i] == 100) {
//                 return 0
//               } else {
//                 return 0.5
//               }
//             })
//
//           //ラベル作成
//           svg.append("g")
//             .attr("class", "value_label")
//             .selectAll("dummy")
//             .data(data.label.features)
//             .enter()
//             .append("text")
//             .text(function(d,i){
//               var citycode_tip = d.properties.N03_007
//               methodvalue = $("input[name=method]:checked").val();
//               if(methodvalue == 0){
//                 for (j = 0; j < data.map.features.length; j++) {
//                   if (data.map.features[j].properties.N03_007 == citycode_tip) {
//                     return d3.format(".1%")(data.map.features[j].properties.datavalue)
//                   }
//                 }
//               } else {
//                 for(var key in mapdata){
//                   if(key == citycode_tip){
//                     return d3.format(",")(mapdata[key])
//                   }
//                 }
//               }
//             })
//             .attr("dy", "0.6em")
//             .attr("opacity", function(){
//               if(zoomlevel < threshold[0]){
//                 return "0"
//               } else {
//                 return "1"
//               }
//             })
//             .attr("font-size", function(){
//               if(zoomlevel > threshold[2]){
//                 return "1.2vw"
//               } else if(zoomlevel > threshold[1]){
//                 return "1vw"
//               } else {
//                 return "0.8vw"
//               }
//             })
//             .each(update_label)
//
//           function update_label(d){
//             d.pos = map.latLngToLayerPoint(new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0]));
//             d3.select(this).attr("transform", "translate(" +d.pos.x+ ", "+d.pos.y+")")
//           }
//         } //function updatemap end
//       } //function updatedataset end
//     })
//   });
}


loaddata();

//text折り返しapi https://s8a.jp/jquery-text-with-lf
(function(r){function l(a){return b(a,c,t,function(a){return u[a]})}function m(a){return b(a,f,v,function(a){return w[a]})}function b(a,b,d,e){return a&&d.test(a)?a.replace(b,e):a}function d(a){if(null==a)return"";if("string"==typeof a)return a;if(Array.isArray(a))return a.map(d)+"";var b=a+"";return"0"==b&&1/a==-(1/0)?"-0":b}var u={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},c=/[&<>"']/g,t=new RegExp(c.source),w={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'"},f=/&(?:amp|lt|gt|quot|#39);/g,
v=new RegExp(f.source),e=/<(?:.|\n)*?>/mg,n=new RegExp(e.source),g=/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,p=new RegExp(g.source),h=/<br\s*\/?>/mg,q=new RegExp(h.source);r.fn.textWithLF=function(a){var c=typeof a;return"undefined"==c?m(b(b(this.html(),h,q,"\n"),e,n,"")):this.html("function"==c?function(c,f){var k=a.call(this,c,m(b(b(f,h,q,"\n"),e,n,"")));return"undefined"==typeof k?k:b(l(d(k)),g,p,"$1<br>")}:b(l(d(a)),g,p,"$1<br>"))}})(jQuery);
