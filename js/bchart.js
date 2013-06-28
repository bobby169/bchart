/**
 * author: bonny
 * xiaohupi@163.com
 * Date: 13-6-19
 */
(function(win){
    var Bchart=win.Bchart=win.Bchart||{};
    Bchart.Grid=function(){
        this.elems=[];
        this.spanY=35;
        this.spanX=30;
        this.init();
    }
    Bchart.Grid.prototype={
        init:function(){
            this.draw(this.spanX,this.spanY);
        },
        draw:function(spanX,spanY){
            var tableWidth=(40+1)*spanY+1;
            var $table=$("<table style='width:"+tableWidth+"px'></table>").appendTo(Bchart.Proxy);
            Bchart.Proxy.css("width",tableWidth);
            for(var i=0;i<spanX;i++){
                var $tr=$("<tr></tr>");
                for(var j=0;j<spanY;j++){
                    var $td=$("<td></td>");
                    $tr.append($td);
                }
                $table.append($tr);
            }
            this.elems.push($table);
        },
        update:function(){
            this.elems[0].remove();
            Bchart.Proxy.append(this.draw(13,4));
        },
        zoom:function(zoom){
            var _elem = document.body;
            var sheet = _elem.styleSheet ? _elem.styleSheet : (_elem.sheet || document.styleSheets[document.styleSheets.length - 1]);
            var rules = sheet.cssRules || sheet.rules;
           // console.info(rules);
            for(var i= 0,len=rules.length;i<len;i++){
                if (rules[i].selectorText.toLowerCase() ==".bchart-proxy"){
                   // var height=$(".bchart-container table tr td").height();

                    //console.info(rules[i]);
                    //rules[i].style.cssText="border:5px solid red";
                    if(zoom==1){
                        rules[i].style.zoom=2;
                        //if(height>80) return;
                        //rules[i].style.height=height*2+"px";
                        //$(".bchart-cell").css({height:$(".bchart-cell").height()*2-9+"px"});*//*
                    }else{
                        rules[i].style.zoom=1;
                        //if(height<10) return;
                        //rules[i].style.height=height*(1/2)+"px";
                        //$(".bchart-cell").css({height:$(".bchart-cell").height()*(1/2)+5+"px"});

                    }
                    //update Proxy
                    var h=$(".bchart-container table").height();
                    Bchart.Proxy.css({height:h});
                    break;
                }
            }

        }
    }

    Bchart.Cell=function(opt){
        this.height=opt.height;
        this.elems=[];
        this.spanY=35;
        this.spanX=30;
        this.init();
        //this.color=opt.color;
    }

    Bchart.Cell.prototype={
        init:function(){
            this.draw(this.spanX,this.spanY);
        },
        draw:function(spanX,spanY){
            for(var j=0;j<spanY;j++){
                var $cell=$("<div class='bchart-cell'></div>").css({"height":Bchart.Util.randomInt(20,200),width:10,left:j*41,background:"#99dcf9"}).appendTo(Bchart.Proxy);
                this.elems.push($cell);
            }
        }


    }

    Bchart.Twobar=function(type){
        this.type=type;
        this.init();
    }
    Bchart.Twobar.prototype={
        init:function(){
            this.draw();
        },
        draw:function(){
            if(this.type=="dist"){
               // var i=0;
                var $twobarDist=$("<div class='bchart-twobar-"+this.type+"'></div>").css({"left":"205px","height":"80px"}).appendTo(Bchart.Proxy);
                Bchart.Event.drag($twobarDist,{
                    direction:"left"
                },function(e,currentElement,curDate,moveDate){
                    var h=$twobarDist.height();
                    var change=curDate+moveDate;
                    console.info(change)

                    h=  $(".bchart-twobar-src").height()+change*10-2*10;
                    //console.info(h)
                    $twobarDist.css({height:h+"px"}).attr("title",h);
                    //i++;
                    //console.info(change)
                    //console.info(curDate,moveDate)
                    return true;
                })
            }else{
                var $twobarSrc=$("<div class='bchart-twobar-"+this.type+"'></div>").css({"left":"82px"}).appendTo(Bchart.Proxy);
                Bchart.Event.resize($twobarSrc);
            }

        }
    }


    Bchart.Coordinate=function(type){
        this.type=type;
        this.spanY=35;
        this.spanX=30;
        this.init();
    }
    Bchart.Coordinate.prototype={
        init:function(){
            this.draw(this.spanX,this.spanY);
        },
        draw:function(spanX,spanY){
            var tableWidth=(40+1)*spanY+1;
            var $coordXs=$("<div class='bchart-coordinateX-box' style='width: "+tableWidth+"px;'></div>");
            var $coordYs=$("<div class='bchart-coordinateY-box'></div>");
            for(var i=0;i<spanX;i++){
                var $coordX=$("<span class='bchart-coordinateX' style='width:41px'>"+i+"</span>").appendTo($coordXs);
            }
            for(var j=0;j<spanY;j++){
                var $coordY=$("<span class='bchart-coordinateY' style='height:21px;'>200,000</span>").appendTo($coordYs);

            }
            Bchart.Containner.append($coordXs).append($coordYs);
        }
    }

    Bchart.Event={
        scroll:function(target){
            var v,mapbox= Bchart.Containner[0];
            var scrollFunc=function(e){
                e=e || window.event;
                v=e.wheelDelta||e.detail;
                v<0&&v!=0&&target.zoom(-1);
                v>0&&v!=0&&target.zoom(1);
                e.returnValue=false;
                return false;
            }
            /*注册事件*/
            if(document.addEventListener){
                mapbox.addEventListener('DOMMouseScroll',scrollFunc,false);
            }//W3C
            mapbox.onmousewheel=scrollFunc;//IE/Opera/Chrome
            mapbox.oncontextmenu=function(){return false;}
        },
        drag:function(target,options,callback){
            var isMouseDown = false,
                currentElement = null,
                dragCallbacks = {},
                bubblings = {},
                lastMouseX,
                lastMouseY,
                lastElemTop,
                lastElemLeft,
                dragStatus = {},
                holdingHandler = false,
                curDate= 0,
                moveDate= 0,
                def= $.extend({

                },options);

            var getMousePosition = function(e){
                var posx = 0;
                var posy = 0;
                if (!e) var e = window.event;
                if (e.pageX || e.pageY) {
                    posx = e.pageX;
                    posy = e.pageY;
                }
                else if (e.clientX || e.clientY) {
                    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }
                return { 'x': posx, 'y': posy };
            };
            var updatePosition = function(e) {
                var pos = getMousePosition(e);
                var spanX = (pos.x - lastMouseX);
                var spanY = (pos.y - lastMouseY);
                var w= currentElement.offsetWidth-Bchart.Containner[0].offsetWidth;
                var h= currentElement.offsetHeight-Bchart.Containner[0].offsetHeight;
                /*if(lastElemLeft + spanX>0){
                    $(currentElement).css({"left":0});
                    return;
                }else if(lastElemLeft + spanX<(-w)){
                    $(currentElement).css({"left":(-w)+"px"});
                    return;
                }
                if(lastElemTop + spanY>0){
                    $(currentElement).css({"top":0});
                    return;
                }else if(lastElemTop + spanY<(-h)){
                    $(currentElement).css({"top":(-h)+"px"});
                    return;
                } */
                if(def.direction=="top"){
                    $(currentElement).css("top", (lastElemTop + spanY));
                }else if(def.direction=="left"){
                    $(currentElement).css("left", (lastElemLeft + spanX));
                    curDate=lastElemLeft/41;
                    moveDate=spanX/41;
                   // console.info(curDate,moveDate)
                }else{
                    $(currentElement).css("top", (lastElemTop + spanY));
                    $(currentElement).css("left", (lastElemLeft + spanX));
                }

            };

            $(document).mousemove(function(e){
                var canDrag=true;

                if(isMouseDown && dragStatus[currentElement.id] != 'false'){
                    if(callback != undefined){
                       //拖动觖发的事件必须返回return true才能拖动
                       canDrag= !! callback.call(currentElement.id,e,currentElement,curDate,moveDate);
                    }
                    if(canDrag) updatePosition(e);
                    return false;
                }
            });
            $(document).mouseup(function(e){
                if(isMouseDown && dragStatus[currentElement.id] != 'false'){
                    isMouseDown = false;
                    return false;
                }
            });
            (function(allowBubbling ){
                target.each(function(){
                    if(undefined == this.id || !this.id.length) this.id = "drag"+(new Date().getTime());
                    bubblings[this.id] = allowBubbling ? true : false;
                    dragStatus[this.id] = "on";
                    $(this).css("cursor", "move");
                    $(this).mousedown(function(e){
                        if((dragStatus[this.id] == "off") || (dragStatus[this.id] == "handler" && !holdingHandler))
                            return bubblings[this.id];
                        $(this).css("position", "absolute");
                        //$(this).css("z-index", parseInt( new Date().getTime()/1000 ));
                        isMouseDown = true;
                        currentElement = this;
                        var pos = $.getMousePosition(e);
                        lastMouseX = pos.x;
                        lastMouseY = pos.y;
                        lastElemTop = this.offsetTop;
                        lastElemLeft = this.offsetLeft;
                        $.updatePosition(e);
                        return bubblings[this.id];
                    });
                })

            })();
        },
        resize:function(target,callback){
            var isMouseDown = false,
                currentElement = null,
                lastMouseX,
                lastMouseY,
                lastElemTop,
                lastElemLeft,
                curDate= 0,
                moveDate= 0;

            var getMousePosition = function(e){
                var posx = 0;
                var posy = 0;
                if (!e) var e = window.event;
                if (e.pageX || e.pageY) {
                    posx = e.pageX;
                    posy = e.pageY;
                }
                else if (e.clientX || e.clientY) {
                    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }
                return { 'x': posx, 'y': posy };
            };

            var updateResize=function(e){
                var pos = getMousePosition(e);
                var spanX = (pos.x - lastMouseX);
                var spanY = (pos.y - lastMouseY);
                var h=$(currentElement).height();
                $(currentElement).css({"height":h-spanY})
               // console.info(spanX,spanY)
            }

            $(document).mousemove(function(e){
                var canResize=true;

                if(isMouseDown){
                    if(callback != undefined){
                        //拖动觖发的事件必须返回return true才能resize
                        canResize= !! callback.call(currentElement,e,currentElement,curDate,moveDate);
                    }
                    if(canResize) updateResize(e);
                    return false;
                }
            });
            $(document).mouseup(function(e){
                if(isMouseDown){
                    isMouseDown = false;
                    return false;
                }
            });

            (function(allowBubbling ){
                target.each(function(e){
                    $(this).css("cursor", "n-resize");
                    $(this).mousedown(function(e){
                        isMouseDown = true;
                        currentElement = this;
                        var pos = $.getMousePosition(e);
                        lastMouseX = pos.x;
                        lastMouseY = pos.y;
                        lastElemTop = this.offsetTop;
                        lastElemLeft = this.offsetLeft;
                        updateResize(e);
                    });
                })

            })();
        }

    }
    Bchart.Util={
        randomInt:function(min,max){
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
    }
    Bchart.Init=function(containner){
        Bchart.Containner=containner||$("<div class='bchart-containner'></div>").appendTo($(document.body));
        Bchart.Containner.addClass("bchart-container");
        Bchart.Proxybox=$("<div class='bchart-proxybox'></div>").css({width:Bchart.Containner.width()-50-5,height:Bchart.Containner.height()-15}).appendTo(Bchart.Containner);
        Bchart.Proxy= $("<div class='bchart-proxy'></div>").appendTo(Bchart.Proxybox);
        var grid=new Bchart.Grid();
        //grid.update();
        grid.zoom();
        Bchart.Event.scroll(grid);

        var cell=new Bchart.Cell(30);
        var coor =new Bchart.Coordinate();

        new Bchart.Twobar("src");
        new Bchart.Twobar("dist");
        //cell.render();
        //console.info(cell.elems[0])
        //cell.elems[5].css({"background":"red"})
        Bchart.Event.drag($(".bchart-proxy"),{
             direction:"left"
        })
    //  $(".bchart-cell").easydrag()
    }
})(window)