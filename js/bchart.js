/**
 * author: bonny
 * xiaohupi@163.com
 * Date: 13-6-19
 */
(function(win){
    var Bchart=win.Bchart=win.Bchart||{};
    Bchart.Grid=function(){
        this.elem=null;
        this.col=15;
        this.row=50;
        this.init();
    }
    Bchart.Grid.prototype={
        init:function(){
            Bchart.Containner.append(this.render(this.row,this.col));
        },
        render:function(row,col){
            var tableWidth=(60+1)*col+1;
            var $table=$("<table style='width:"+tableWidth+"px'></table>");
            for(var i=0;i<row;i++){
                var $tr=$("<tr></tr>");
                for(var j=0;j<col;j++){
                    var $td=$("<td></td>");
                    $tr.append($td);
                }
                $table.append($tr);
            }

            this.elem=$table;
            return this.elem;
        },
        update:function(){
            this.elem.remove();
            Bchart.Containner.append(this.render(13,4));
        },
        zoom:function(zoom){
            var _elem = document.body;
            var sheet = _elem.styleSheet ? _elem.styleSheet : (_elem.sheet || document.styleSheets[document.styleSheets.length - 1]);
            var rules = sheet.cssRules || sheet.rules;
            //console.info(rules);
            for(var i= 0,len=rules.length;i<len;i++){
                if (rules[i].selectorText.toLowerCase() ==".bchart-container table tr td"){
                    var height=$(".bchart-container table tr td").height();
                    //console.info(rules[i]);
                    //rules[i].style.cssText="border:5px solid red";
                    if(zoom==1){
                        rules[i].style.height=height*1.25+"px";
                    }else{
                        rules[i].style.height=height*(4/5)+"px";
                    }

                }
            }

        }
    }

    Bchart.Cell=function(opt){
        this.height=opt.height;
        //this.color=opt.color;
    }

    Bchart.Cell.prototype={
        draw:function(){

        },
        render:function(){
            var td=$(".bchart-container table tr").eq(0).find("td");
            for(var i=0;i<td.length;i++){
                var $cell=$("<div class='cell'></div>").css({"height":100,width:10,left:i*61,background:"blue"}).appendTo(Bchart.Containner);


            }
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

                if(lastElemLeft + spanX>0){
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
                }
                if(def.direction=="top"){
                    $(currentElement).css("top", (lastElemTop + spanY));
                }else if(def.direction=="left"){
                    $(currentElement).css("left", (lastElemLeft + spanX));
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
                       canDrag= !! callback.call(currentElement.id,e,currentElement);
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
                var me=target[0];
                if(undefined == me.id || !me.id.length) me.id = "drag"+(new Date().getTime());
                bubblings[me.id] = allowBubbling ? true : false;
                dragStatus[me.id] = "on";
                target.css("cursor", "move");
                target.mousedown(function(e){
                    if((dragStatus[me.id] == "off") || (dragStatus[me.id] == "handler" && !holdingHandler))
                        return bubblings[me.id];
                    target.css("position", "absolute");
                   // target.css("z-index", parseInt( new Date().getTime()/1000 ));
                    isMouseDown = true;
                    currentElement = me;
                    var pos = getMousePosition(e);
                    lastMouseX = pos.x;
                    lastMouseY = pos.y;
                    lastElemTop = me.offsetTop;
                    lastElemLeft = me.offsetLeft;
                    updatePosition(e);
                    return bubblings[me.id];
                });
            })();
           /* $.fn.ondrag = function(callback){
                return this.each(function(){
                    dragCallbacks[this.id] = callback;
                });
            };

               */
        }

    }
    Bchart.Init=function(containner){
        Bchart.Containner=containner||$("<div class='bchart-containner'></div>").appendTo($(document.body));
        Bchart.Containner.addClass("bchart-container");
        Bchart.Proxy= $("<div class='bchart-proxy'></div>").appendTo(Bchart.Containner);
        var grid=new Bchart.Grid();
        //grid.update();
        grid.zoom();
        Bchart.Event.scroll(grid);
        Bchart.Event.drag($("table"),{
           // direction:"left"
        })
        var cell=new Bchart.Cell(30);
        cell.render();
      //$("table").easydrag()
    }
})(window)