define(function(require, exports, module) {

    var Widget = require('widget');
    var Overlay = require('overlay');
    var AutoComplete = require('autocomplete');
    var Notify = require('common/bootstrap-notify');
    var Ztree = require('ztree');
    require('ztree-css');
    var TagChooser = Widget.extend({
        attrs: {
            multi: true,
            type:'knowledge',
            choosedTags: []
        },

        _tagOverlay: null,

        events: {
            'click .dropdown' : 'onDropdown',
            'click .tag-cancel': 'onTagCancel',
            'click .tag-confirm': 'onTagConfirm',
            'click .tag-item': 'onTagItem',
            'click .tag-remove': 'onTagRemove'
        },

        setup: function() {

            var $tree = $('#knowledge-tree');

            var overlayY = this.$('.input-group').height();
            var overlayWidth = this.$('.input-group').width();

            var overlay = new Overlay({
                element: this.$('.tag-overlay'),
                width: overlayWidth,
                height: 300,
                align: {
                    baseElement: this.$('.input-group'),
                    baseXY: [0, overlayY]
                }

            });

            overlay._blurHide([overlay.element, this.$('.dropdown')]);

            this._tagOverlay = overlay;

            var autocomplete = new AutoComplete({
                trigger: '#tags-input',
                dataSource: $('#tags-input').data('url'),
                filter: {
                    name: 'stringMatch',
                    options: {
                        key: 'id',
                        key: 'name'
                    }
                },
                selectFirst: true
            }).render();



            autocomplete.on('itemSelect', function(data){

                $('#tags-input').val('');

                var $tags = $('.tags-choosed');

                var error = "";

                var $tagTemplate = $('.choosed-tag-template');
                var $tag = $tagTemplate.clone().removeClass('choosed-tag-template');
                var choosedTags = [];

                $tag.find('.tag-name-placeholder').html(data.name);

                $tags.find('.tag-name-placeholder').each(function(index,item){
                    if ($(item).text() == data.name) {
                        error = "已添加，不能重复添加!";
                    };
                });
                if (error) {
                    Notify.danger(error);
                } else {
                    $tag.find('.tag-name-placeholder').attr("data-id",data.id)
                    $tag.find('.tag-name-placeholder').attr("data-name",data.name)
                    $tags.append($tag);
                }
            });

            var setting = {
                async: {
                    enable: true,
                    url:$tree.data('url'),
                    autoParam:["id"],
                    otherParam:{"categoryId":$tree.data('cid')}
                    //dataFilter: filter
                },
                view: {
                    expandSpeed:"",
                    selectedMulti: false,
                    showLine: false,
                    showIcon: false,
                    addDiyDom: addDiyDom
                },
                edit: {
                    enable: true,
                    showRemoveBtn: false,
                    showRenameBtn: false
                },
                data: {
                    simpleData: {
                        enable: true,
                        idkey: "id",
                        pidKey: "pid"
                    }
                },
                callback: {
                }
            };


        function addDiyDom(treeId, treeNode) {
            var html = '<div class="actions ">';
            html += '<span class="btn btn-link btn-sm "    id="checkBtn_'+treeNode.tId+'"><label><input class="knowledge-checkbox tag-item-'+treeNode.id+'" data-id="'+treeNode.id+'" data-name="'+treeNode.name+'" type="checkbox"></label></span>';
            html += '</div>';
            $('#' + treeNode.tId + '_a').after(html);
            $('#knowledge-tree_1_switch').click();
            $('#knowledge-tree_2_switch').click();
        };

            $.fn.zTree.init($("#knowledge-tree"), setting);

        },

        onDropdown: function(e) {
            if (this._tagOverlay.get('visible')) {
                this._tagOverlay.hide();
            } else {
                this._initData();
                this._tagOverlay.show();
            }
        },

        onTagCancel: function(e) {
            this._tagOverlay.hide();
        },

        onTagConfirm: function(e) {
            if (this.get('type') == 'knowledge') {
                this.$('.knowledge-list').find('.knowledge-checkbox').each(function(index,item){
                    if ($(item).is(':checked')) {
                        $(item).addClass('tag-item-choosed')
                    };
                });
            };

            var choosedTags = [];
            this.$('.tag-overlay').find('.tag-item-choosed').each(function(index, item) {
                var $item = $(item);
                choosedTags.push($item.data());
            });
            this.set('choosedTags', choosedTags);
            this.trigger('choosed', choosedTags);
            this._tagOverlay.hide();
        },

        onTagRemove: function (e) {
            $(e.currentTarget).parents('.choosed-tag').remove();

            var choosedTags = [];
            this.$('.tags-choosed').find('.choosed-tag').each(function(index, item) {
                choosedTags.push($(item).data());
            });
            // this.set('choosedTags', choosedTags);
        },

        onTagItem: function(e) {
            var $item = $(e.currentTarget);

            if (this.get('multi')) {
                if ($item.hasClass('tag-item-choosed')) {
                    $item.removeClass('tag-item-choosed');
                } else {
                    $item.addClass('tag-item-choosed');
                }
            } else {
                this.element.find('.tag-item-choosed').removeClass('tag-item-choosed');
                $item.addClass('tag-item-choosed');
            }

        },

        _onChangeChoosedTags: function(tags) {
            var $tags = this.$('.tags-choosed').empty();

            var $tagTemplate = this.$('.choosed-tag-template');

            $.each(tags, function(index, tag) {
                var $tag = $tagTemplate.clone().removeClass('choosed-tag-template');
                $tag.data(tag);
                $tag.find('.tag-name-placeholder').attr("data-id",tag.id)
                $tag.find('.tag-name-placeholder').attr("data-name",tag.name)

                $tag.find('.tag-name-placeholder').html(tag.name);
                $tags.append($tag);
            });
        },

        _initData: function() {
            var self = this;
            self.$('.tag-overlay').find('.tag-item-choosed').removeClass('tag-item-choosed');
            if (self.get('type') == "knowledge") {
                self.$('.tag-overlay').find('.knowledge-checkbox').attr("checked",false);
            }

            $('.choosed-tag').each(function(index,item){
                var itemId = $(item).find('.tag-name-placeholder').data('id');
                if (self.get('type') == "knowledge") {
                    console.log($('#tag-item-'+itemId).parent())
                    // $('#tag-item-'+itemId).parent();
                    self.$('.tag-overlay').find('.tag-item-' + itemId).prop('checked', true);
                } else {
                    self.$('.tag-overlay').find('.tag-item-' + itemId).addClass('tag-item-choosed');
                }
            });

            // $.each(self.get('choosedTags'), function(index, tag) {
            //     if (self.get('type') == "knowledge") {
            //         self.$('.tag-overlay').find('.tag-item-' + tag.id).prop('checked', true);
            //     } else {
            //         self.$('.tag-overlay').find('.tag-item-' + tag.id).addClass('tag-item-choosed');
            //     }
            // });
        }

    });

    module.exports = TagChooser;
});