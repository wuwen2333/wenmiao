/**
 * 文描编辑
 * @authors Wuwen (wuwen1@yhd.com)
 * @date    2017-04-13 14:36:19
 */
define(['jquery','jqueryUI'],function($){
    var exports = {};
    // 默认文字部件数据
    var defaultText = {
        "id":"",
        "name":"部件（文字）",
        "type":"text",
        "value":"部件（文字）",
        "boxStyle":{
            "top":"1",
            "left":"10",
            "width":"150",
            "height":"100",
            "background-color":"transparent"
        },
        "widgetStyle":{
            "color": "#333",
            "font-size": "16",
            "font-weight": "normal",
            "font-style": "normal",
            "font-family": "simhei",
            "text-decoration": "none",
            "text-align": "center",
            "link": ""
        }
    }; 
    // 默认图片部件数据
    var defaultPic = {
        "id":"",
        "name":"部件（图片）",
        "type":"pic",
        "value":"部件（图片）",
        "alt": "",
        "link": "",
        "boxStyle":{
            "top":"100",
            "left":"200",
            "width":"300",
            "height":"200"
        },
        "widgetStyle":{
            "border-radius":"0",
            "background-image":"url(http://skuzx.jd.com/misc-v2/resource/pic-default.png)"
        }
    };
    // 默认模块数据
    var defaultModule = {
        "id":"M1491879530538",
        "name":"模块",
        "boxStyle":{
            "width":"790",
            "height":"400",
            "background-image":"",
            "background-color":"transparent"
        },
        "widget":[]
    };

    var handlesAll = 'nw, ne, e, s, se, sw'; // 可拖拽改变大小
    var handlesBtm = 's'; // 仅可拖动高度

    var $modTitList = $('.module_title_list'); // list容器
    var $center = $('.center').find('.center_wrap'); // 预览区域容器

    // 当前选中元素
    var allData,curData,$curItem;
    // 初始渲染页面
    exports.initRender = function(data){
        var initHtml = '',
            initListHtml = '';
        var len = data.length,
            widgetLen;
        var m,w;

        for(m = 0; m < len ; m++){
            initHtml += '<div id="'+data[m].id+'" class="module cur" style="'+ exports.joinStyle(data[m].boxStyle) +'"><div class="line"></div>';
            initListHtml += '<dl class="mod_tit_box" data-module="'+ data[m].id +'">'
                            +'<dt class="title">'+data[m].name+'</dt>';
            widgetLen = data[m].widget.length;
            for(w = 0; w < widgetLen ; w++){
                initListHtml += '<dd data-widget="'+data[m].widget[w].id+'">'+ data[m].widget[w].name +'</dd>';
                initHtml += exports.joinItemDom(data[m].widget[w]);
            }
            initHtml += '</div>';
            initListHtml += '</dl>';
        }
        $center.append(initHtml);
        $modTitList.append(initListHtml);
        // 绑定拖拽
        for(m = 0; m < len ; m++){
            widgetLen = data[m].widget.length;
            exports.bindResize(data[m].id,handlesBtm);
            for(w = 0; w < widgetLen ; w++){
                exports.bindDrag(data[m].widget[w].id); 
                exports.bindResize(data[m].widget[w].id,handlesAll);
            }
        }
        $('.widget',$center).first().trigger('mousedown');
    }
    // 点击事件
    exports.bindEvents = function(){
        // 属性编辑模块
        var $moduleAttr = $('.attr_module'),
            $textAttr = $('.attr_text'),
            $picAttr = $('.attr_pic');
        // 点击列表高亮
        $modTitList.on('click','dt,dd',function(e){
            e.stopPropagation();
            $modTitList.find('.cur').removeClass('cur');
            exports.light($(this).parent('dl'));
            if($(this).is('dt')){
                $('#'+$(this).parent('dl').attr('data-module')).trigger('mousedown','trigger');
            }else if($(this).is('dd')){
                $('#'+$(this).attr('data-widget')).trigger('mousedown','trigger');
            }  
        // module顺序，widget层级
        }).on('click','em',function(e){
            e.stopPropagation();
            if($(this).hasClass('unable')){
                return false;
            }
            changeOrder($(this));           
        })
        // 点击模块高亮
        $center.on('mousedown','.module,.widget',function(e,method){
            e.stopPropagation();
            $curItem = $(this);
            itemClickHandle($curItem,method);
        }); 
        // 编辑属性         
        $('.attr_edit').on('input','input,textarea',function(){
            editAttr($(this));                              
        }).on('change','input,textarea,select',function(){
            editAttr($(this));
            exports.saveData(curData);
        })
        // 改变顺序
        function changeOrder($obj){
            var isWidget = $obj.parents('dd').length != 0;
            var thisList,thisModule,thisIndex;
            var arr,paramIndex;
            if(isWidget){
                thisList = $obj.parents('dd');
                thisModule = $('#'+thisList.attr('data-widget'));
                paramIndex = thisList.index()-1;
                arr = allData[thisList.parent('dl').index()].widget;               
            }else{
                thisList = $obj.parents('dl');
                thisModule = $('#'+thisList.attr('data-module'));
                paramIndex = thisList.index();
                arr = allData;
            }        
            if($obj.hasClass('up')){
                moveData(arr,paramIndex,paramIndex - 1);
                thisList.insertBefore(thisList.prev());
                thisModule.insertBefore(thisModule.prev());
            }else if($obj.hasClass('down')){
                moveData(arr,paramIndex,paramIndex + 1);
                thisList.insertAfter(thisList.next());
                thisModule.insertAfter(thisModule.next());
            }
        }
        // 交换数组
        function moveData(arr,index1,index2){
            arr[index1] = arr.splice(index2, 1, arr[index1])[0];
            return arr;
        }
        // 编辑属性 
        function editAttr($obj,method){
            var thisVal = $obj.val().replace(/\n|\r\n/g,"<br>");
            var attrName = $obj.attr('name');
            var attrStyle = $obj.attr('data-style');
            // 样式属性
            if(attrStyle){
                curData[attrStyle][attrName] = thisVal;
                switch(attrStyle){
                    case 'boxStyle':
                        $curItem.attr('style',exports.joinStyle(curData[attrStyle]));
                        break;
                    case 'widgetStyle':
                        $curItem.find('.'+curData.type).attr('style',exports.joinStyle(curData[attrStyle]));
                        break; 
                }
            // 其他属性
            }else{
                curData[attrName] = thisVal;
                switch(attrName){
                    case 'value':
                        $curItem.find('.text').html(thisVal);
                        break;
                    case 'link':
                        $curItem.addClass('has_link');
                        break;
                    default:
                        $curItem.attr(attrName,thisVal);
                        break;
                }
            } 
        }
        // @param method 触发方式 ['trigger']
        // 点击元素对应列表高亮 
        function itemClickHandle($obj,method){
            var id = $obj.attr('id');
            var curModule,scrollTop;

            $center.find('.cur').removeClass('cur');
            $modTitList.find('.cur').removeClass('cur');
            $obj.addClass('cur');
            
            if($obj.hasClass('widget')){
                curModule = $modTitList.find('[data-widget="'+id+'"]');
                exports.light(curModule.parents('dl'));
                scrollTop = $obj.parents('.module').position().top - $('.module').first().position().top;
            }else if($obj.hasClass('module')){
                curModule = $modTitList.find('[data-module="'+id+'"]');
                scrollTop = $obj.position().top - $('.module').first().position().top;
            }
            method ? $('.center').scrollTop(scrollTop) : ''; 
            exports.light(curModule);
            renderAttr(id);               
        }
        // 填充表单属性
        function renderAttr(id){
            if(id == $('.attr_edit.cur').attr('data-module')){
                return false;
            }
            var $curAttr;
            var len = allData.length,widgetLen;
            for(var m = 0;m<len;m++){
                if(allData[m].id == id){
                    curData = allData[m];
                    break;
                }else{
                    widgetLen = allData[m].widget.length;
                    for(var w = 0;w < widgetLen;w++){
                        if(allData[m].widget[w].id == id){
                            curData = allData[m].widget[w];
                            break;
                        }
                    }
                }
            }

            var curType = curData.type ? curData.type : 'module';

            switch (curType){
                case 'module':
                    $curAttr = $moduleAttr;
                    break;
                case 'pic':
                    $curAttr = $picAttr;
                    break;
                case 'text':
                    $curAttr = $textAttr;                       
                    break;
            }
            $curAttr.attr('data-module',id).addClass('cur').siblings('.attr_edit').removeClass('cur');
            exports.bindData(curData);
        }
    }
    // 添加模块
    exports.addItem = function(){
        // 增加普通模块
        $('.btn_add_module').on('click',function(){
            var id = 'M'+new Date().getTime();               
            curData = defaultModule;
            curData.id = id;
            pushData(curData);

            var htmlList = '<dl class="mod_tit_box" data-module="'+id+'">'
                                +'<dt class="title">'+curData.name+'</dt>'
                            +'</dl>';
            // 左
            $modTitList.append(htmlList);
            var moduleIndex = $modTitList.find('dl').length - 1;
            // 中
            $center.append(exports.joinItemDom(curData));
            exports.bindResize(id,handlesBtm);
            $('.module',$center).last().trigger('mousedown','trigger');
        });

        // 添加图片或文本元素
        $('.btn_wrap').on('click','.btn',function(){
            var curlist = $modTitList.find('dl.cur');
            var curModule = $('#'+curlist.attr('data-module'));
            var id = 'W'+new Date().getTime(); 

            if($(this).hasClass('btn_add_pic')){
                curData = defaultPic;
                curlist.append('<dd data-widget="'+id+'">部件（图片</dd>');
            }else if($(this).hasClass('btn_add_text')){
                curData = defaultText;
                curlist.append('<dd data-widget="'+id+'">部件（文字</dd>');
            }   
            curData.id = id; 
            pushData(curData,curModule);
            var moduleIndex = curModule.index();
            var widgetIndex = curModule.find('.widget').length - 1;
            curModule.append(exports.joinItemDom(curData)); 
            exports.bindDrag(id);   
            exports.bindResize(id,handlesAll); 
            $('.widget',curModule).last().trigger('mousedown'); 
            
        })
        // 添加数据
        function pushData(data,module){
            if(module){
                allData[module.index()].widget.push(curData);
            }else{
                allData.push(curData);
            }                   
        }
    }
    // 存储数据
    exports.saveData = function(data){
        var len = allData.length,
            widgetLen;
        for(var m = 0; m < len; m++){
            if(data.id == allData[m].id){
                allData[m] = data;
                break;
            }else{
                widgetLen = allData[m].widget.length;
                for(var w = 0; w < widgetLen; w++){
                    if(data.id == allData[m].widget[w].id){
                        allData[m].widget[w] = data;
                        break;
                    }
                }
            }
        }
        console.log(allData);
    }
    // 表单绑定数据
    exports.bindData = function(data){
        var $curForm = $('.attr_edit.cur');

        // module
        if(!data.type){
            for(item in data.boxStyle){
                $('[name="'+item+'"]',$curForm).val(data.boxStyle[item]);
            }
        // widget
        }else{
            // 非属性的值
            for(item in data){
                if(item == 'value'){
                    // textarea
                    $('[name="'+item+'"]',$curForm).val(data[item].replace(/<br>/g,"\n")); 
                }else{
                    $('[name="'+item+'"]',$curForm).val(data[item]); 
                }                    
            }
            // 外部样式属性
            for(item in data.boxStyle){
                $('[name="'+item+'"]',$curForm).val(data.boxStyle[item]);
            }
            // 文本样式
            if(data.type == 'text'){
                for(item in data.widgetStyle){
                    $('[name="'+item+'"]',$curForm).val(data.widgetStyle[item]);
                }
            }              
        }
    }
    // 绑定拖拽
    exports.bindDrag = function(id){
        $('#'+id).draggable({ 
            containment: "parent",
            cursor:"move",
            drag: function(e,ui) {
                curData.boxStyle.left = ui.position.left;
                curData.boxStyle.top = ui.position.top;
                exports.bindData(curData);
            },
            stop:function(){
                exports.saveData(curData);
            } 
        });
    }
    // 绑定缩放
    exports.bindResize = function(id,handles){
        $('#'+id).resizable({
             handles: handles,
             start: function(event, ui){
                if($(event.originalEvent.target).attr('class').match(/\b(ui-resizable-se)\b/)){
                    $(this).resizable( 'option', 'aspectRatio', true ).data('uiResizable')._aspectRatio = true;
                }
             },
             resize: function(e,ui) {
                if(curData.type){
                    curData.boxStyle.width = ui.size.width;
                    curData.boxStyle.height = ui.size.height;
                    curData.boxStyle.left = ui.position.left;
                    curData.boxStyle.top = ui.position.top;
                }else{
                    curData.boxStyle.width = ui.size.width;
                    curData.boxStyle.height = ui.size.height;
                }                    
                exports.bindData(curData);
             },
             stop: function(event, ui){
                $(this).resizable( 'option', 'aspectRatio', false ).data('uiResizable')._aspectRatio = false;
                exports.saveData(curData);
             }
         });
    }
    // 拼接模块dom
    exports.joinItemDom = function(data){
        var dom;

        if(!data.type){
            dom = '<div id="'+data.id+'" class="module cur" style="'+ exports.joinStyle(data.boxStyle) +'">'
                        +'<div class="line"></div>'
                    +'</div>';
        }else if(data.type == 'pic'){
            dom = '<div id="'+data.id+'" class="widget cur" style="'+ exports.joinStyle(data.boxStyle) +'">'
                    +'<div class="pic" style="'+exports.joinStyle(data.widgetStyle)+'"></div>'
                    +'<div class="line"></div>'
                +'</div>';
        }else if(data.type == 'text'){
            dom = '<div id="'+data.id+'" class="widget cur" style="'+ exports.joinStyle(data.boxStyle) +'">'
                    +'<div class="text" style="'+exports.joinStyle(data.widgetStyle)+'">'+data.value+'</div>'
                    +'<div class="line"></div>'
                +'</div>';
        }
        return dom;
    }
    // 拼接样式字符串
    exports.joinStyle = function(styleObj){
        var style = '';
        for(item in styleObj){
            if(isNaN(styleObj[item]) || !styleObj[item]){
               style += item + ':' + styleObj[item]+';'; 
            }else{
                style += item + ':' + styleObj[item]+'px;';
            }
        }
        return style;
    }
    // 高亮
    exports.light = function($obj){
        $obj.addClass('cur').siblings().removeClass('cur');
    }
    exports.init = function(){
        // $.get("data.json", function(result){
        //     allData = result.data.module;
        //     exports.initRender(allData);
        // });

        allData = data.module;
        this.bindEvents();
        this.initRender(allData);
        this.addItem();
    }
    return exports
});

