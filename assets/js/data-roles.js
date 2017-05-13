$('input[data-role="autocomplete"]').on({
    change: function () {
        $(this).trigger('keyup');
    },
    keyup: function () {
        var self = $(this);
        var val = self.val();
        if (self.data('old_value') == val) {
            return;
        }
        self.data('old_value', val);
        if (val.length < 3) {
            return;
        }
        if (self.data('loading')) {
            self.data('postponed-loading', self.data('postponed-loading') + 1);
            return;
        }
        if (!self.attr('id')) {
            var i = 0, name, o_name = self.attr('name');
            while ($('[name="' + (name = o_name + "_" + (++i)) + '"]').length > 0);
            self.attr('id', name);
        }
        var data_list_id = 'datalist_for_' + self.attr('id');
        if (!self.data('list')) {
            var datalist = $('<datalist></datalist>');
            datalist.attr('id', data_list_id);
            self.parent().append(datalist);
            self.data('list', data_list_id);
        } else {
            var datalist = $('#' + data_list_id);
        }

        var request = {
            url: self.data('src'),
            cache: self.data('cache') ? (parseInt(self.data('cache')) ? true : false) : false,
            data: {},
            crossDomain: self.data('cross-domain') ? self.data('cross-domain') : true,
            method: self.data('method') ? self.data('method') : 'GET',
            success: function (data, textStatus, jqXHR) {
                $('option', datalist).remove();
                var key_to_read = self.data('key');
                var items = Array.isArray(data) ? data : data.items;
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (!item || !item[key_to_read]) {
                        continue;
                    }
                    datalist.append("<option value='" + item[key_to_read] + "'>");
                }
                self.attr('list', data_list_id);
                self.data('loading', false);
                if (self.data('postponed-loading')) {
                    self.data('postponed-loading', null);
                    self.trigger('keyup');
                }
            }
        };

        var data = self.data();
        var c = 0;
        for (var k in data) {
            if (k.beginsWith('param')) {
                request.data[k.extractParamNameFromDataName('param')] = data[k];
                c++;
            }
            if (k.beginsWith('dynParam')) {
                var cmd = data[k].replace('this.', 'self.') + ';';
                request.data[k.extractParamNameFromDataName('dynParam')] = eval(cmd);
                c++;
            }
        }

        if (c == 0 && self.attr('list')) {
            return;
        }

        if (window.jobtestvault && window.jobtestvault.config && window.jobtestvault.config.github) {
            if (window.jobtestvault.config.github.token) {
                request.password = window.jobtestvault.config.github.token;
            }
            if (window.jobtestvault.config.github.user) {
                request.username = window.jobtestvault.config.github.user;
            }
        }

        self.removeAttr('list');

        $.ajax(request);
    }
});


$('form[data-role="search"]').on({
    'reset': function () {
        $('input[type!="button"][type!="submit"][type!="reset"]', this).val('');
        $('input', this).first().trigger('change');
    },
    'submit': function (e) {
        e.preventDefault();
        window.history.pushState({}, $(this).data('message'), $('#' + $(this).data('search-url-view')).val());
    }
});
$('form[data-role="search"] input').on({
    change: function () {
        $(this).trigger('keyup');
    },
    keyup: function () {
        var form = $($(this).get(0).form);
        var view = $('#' + form.data('search-url-view'));
        var input_items = $("input", form).filter(function () {
            return !!$(this).val() && !!$(this).attr('name');
        });
        view.val(window.location.href.split('?')[0] + '?' + input_items.serialize());
        var link = encodeURIComponent(view.val());
        if (input_items.length > 0) {
            var message = 'Search in JobTestVault for items where';
            input_items.each(function () {
                message += ' ' + $(this).attr('name') + ' = ' + $(this).val();
            });
        } else {
            var message = 'Search in JobTestVault for all items';
        }
        form.data('message', message);
        message = encodeURIComponent(message);
        $('#' + form.data('share-links-zone') + ' [data-href]').each(function () {
            $(this).attr('href', $(this).data('href').replace('{url}', link).replace('{message}', message));
        });
    }
});

$(function () {
    hello.init({
        github: window.jobtestvault.config.github.client.id
    }, {
        display: 'popup'
    });

    var params = window.location.search.substring(1).parseQuery();
    if (params.error_description) {
        window.jobtestvault.showErrorDialog('Error', params.error_description, true);
        delete params.error_description;
    }
    for (var x in params) {
        $('form[data-role="search"] [name="' + x + '"]').val(params[x]);
    }
    $('form[data-role="search"] input:first-child').change();

    $('[data-role="file-uploader"]').trigger('empty');
});


$('[data-role="get-profile-linkedin"] button').on({
    click: function () {
        var btn = $(this);
        IN.User.authorize(function () {
            btn.trigger('read');
        });
    },
    read: function () {
        var btn = $(this);
        IN.API.Raw("/people/~:(public-profile-url)?format=json").result(function (data) {
            btn.parent().find('input').first().val(data.publicProfileUrl);
        }).error(function (err) {
            btn.parent().find('input').first().val('');
        });
    }
});

$('[data-role="get-profile-github"] button').on({
    click: function () {
        var btn = $(this);
        hello('github').login('github', {
            display: 'popup',
            scope: [
                'user',
                'read:org'
            ],
            redirect_uri: window.jobtestvault.config.github.oauth.redirect_url
        }, function (ret) {
            //alert('login');
            //btn.trigger('read');
        }).then(function (ret) {
            $('[data-role="get-profile-github"] button').trigger('read');
        }, function (e) {
            btn.parent().find('input').first().val('');
            window.jobtestvault.showErrorDialog('GitHub error', e.error.message.replace('+', ' '));
        });
    },
    read: function () {
        var btn = $(this);
        var input = btn.parent().find('input').first();
        hello('github').api('user').then(function (response) {
            input.val(response.url);
            window.jobtestvault.user || (window.jobtestvault.user = {});
            window.jobtestvault.user.github = response;
            $('[data-role="get-profile-github"]').trigger('update_repos_list_available');
        }, function (e) {
            input.val('');
            window.jobtestvault.showErrorDialog('GitHub error', e.error.message.replace('+', ' '));
        });
    }
});

$('[data-role="get-profile-github"]').on({
    update_repos_list_available: function () {
        var container = $(this);
        var target = $('#' + container.data('list-target'));
        target.find('option, optgroup').remove();
        hello('github').api('user/orgs').then(function (response) {
            hello('github').api('user/repos', 'get', {type: 'owner'}).then(function (response) {
                response.data = response.data.filter(function (repo) {
                   return repo.owner.login == window.jobtestvault.user.github.login;
                });
                if (response.data.length < 1) {
                    return;
                }
                var group = $('<optgroup></optgroup>');
                group.attr('label', window.jobtestvault.user.github.login);
                group.append(
                    response.data.map(function (repo) {
                        var option = $('<option>'+repo.full_name+'</option>');
                        option.attr('value', repo.full_name );
                        option.attr('title', repo.description);
                        return option;
                    })
                );
                target.append(group);
                if (!target.val()) {
                    target.val($("option:first", target).val());
                    target.trigger('change');
                }
            }, function (e) {
                console.error(e);
            });
            response.data.forEach(function (org) {
                if (org.login == 'JobTestVault') {
                    return;
                }
                hello('github').api('orgs/'+org.login+'/repos', 'get', {type: 'owner'}).then(function (response) {
                    if (response.data.length < 1) {
                        return;
                    }
                    var group = $('<optgroup></optgroup>');
                    group.attr('label', org.login.descConcat(org.description));
                    group.append(
                        response.data.map(function (repo) {
                            var option = $('<option>'+repo.full_name+'</option>');
                            option.attr('value', repo.full_name );
                            option.attr('title', repo.description);
                            return option;
                        })
                    );
                    target.append(group);
                }, function (e) {
                    console.error(e);
                });
            });
            target.closest('.field').removeClass('hidden');
        }, function (e) {
            console.error(e);
        });
    }
});

$('[data-role="file-uploader"] button').on({
    click: function () {
        $(this).parent().trigger('dialog_show');
    }
});
$('[data-role="file-uploader"]').on('click', '[data-role="remove"]', function () {
        var item = $(this).closest('.item');
        window.jobtestvault.confirm('Remove file?', 'Do you want to remove this file from upload?', ['Yes', 'No'], true, {
            close: function (ret) {
                if (ret == 'yes') {
                    item.find('[data-role="remove"]').remove();
                    item.animate({
                        width: '1px',
                        opacity: 0.25,
                    }, 750, function () {
                       var container = item.parent();
                       if (container.find('.item').length < 2) {
                           container.trigger('empty');
                       }
                       item.remove();
                    });
                }
            }
        });
});
$('[data-role="file-uploader"]').on({
    dialog_show: function () {
        var self = $(this);
        var multiple = parseInt(self.data('multiple')) ? true : false;
        var uploader = $('<input type="file">');
        var name = '__' + self.data('name') + '_file';
        var rname = self.data('name');
        if (multiple) {
            name += "[]";
            rname += '[]';
        }
        uploader.attr('name', name);
        uploader.data('name', rname);
        uploader.css('display', 'none');
        uploader.prop('accept', self.data('accept'));
        uploader.attr('multiple', multiple);
        uploader.on({
            change: function () {
                self.trigger('uploader_change');
            }
        });
        self.append(uploader);
        self.data('uploader', uploader);
        self.data('uploader').click();
    },
    empty: function () {
        var container = $(this);
        var fieldset = container.find('fieldset');
        fieldset.html('<div class="empty">'+container.data('placeholder')+'</div>');
    },
    uploader_change: function () {
        var container = $(this);
        var fieldset = container.find('fieldset');
        var uploader = container.data('uploader');
        var files = uploader.get(0).files;
        var l = files.length;
        if (l == 0 && container.find('.item').length == 0) {
            container.trigger('empty');
            return;
        }
        if (uploader.prop('multiple')) {
            fieldset.find('.empty').remove();
            var item_template = container.find('script[type="x-template-mustache"][data-name="item"]').first().html();
            var loading_template = container.find('script[type="x-template-mustache"][data-name="loading"]').first().html();
            Mustache.parse(item_template);
            Mustache.parse(loading_template);
            var rw, rh;
            var default_loading = $(Mustache.render(loading_template));
            var createLoader = function () {
                var loading = default_loading.clone();
                fieldset.append(loading);
                return loading;
            };
            var createCanvas = function(width, height) {
                var canvas = $('<canvas />');
                canvas.attr('width', width);
                canvas.attr('height', height);
                //console.log(canvas.get(0));
                return canvas.get(0);
            };
            var doResize = function (image, maxWidth, maxHeight, func) {
                var ratio = 0, rw, rh;

                if (image.width > maxWidth) {
                    ratio = maxWidth / image.width;
                    rw = maxWidth;
                    rh = image.height * ratio;
                }

                if (image.height > maxHeight) {
                    ratio = maxHeight / image.height;
                    rw = image.width * ratio;
                    rh = maxHeight;
                }
                
                var canvas = createCanvas(rw, rh);
                pica.WW = true;
                pica.WEBGL = true;
                pica.resizeCanvas(image, canvas, {
                    quality: 3,
                    alpha: false,
                    unsharpAmount: 75,
                    unsharpRadius: 1.0,
                    unsharpThreshold: 0
                }, function (err) {
                    func(
                        canvas.toDataURL()
                    );
                });
            };
            var readFile = function (file, image) {
                var reader = new FileReader();
                reader.onload = function () {
                    image.src = reader.result;
                };
                reader.readAsDataURL(file);
            };
            var createImage = function (loading, file, w, h, func) {
                var image = new Image();
                image.onload = function () {
                    var full_image = $('<input type="hidden" />');
                    full_image.attr('name', uploader.data('name'));
                    var full_image_url = this.toDataURL();
                    full_image.val(full_image_url);
                    var hash =sha1(full_image_url);
                    if (container.find('.item[data-hash="' + hash + '"]').length > 0) {
                        loading.remove();
                        func();
                        return;
                    }
                    doResize(image, w, h, function (url) {
                        var item = $(Mustache.render(item_template, {
                            type: file.type,
                            preview_img: url,
                            file: file.name
                        }));
                        item.append(full_image);
                        item.attr('data-hash', hash);
                        loading.replaceWith(item);
                        func();
                    });
                };
                return image;
            };
            var queue = [];
            var running = false;
            var processNext = function () {
                if (queue.length > 0) {
                    running = true;
                    var func = queue.shift();
                    func();
                } else {
                    processNext = false;
                }
            };
            var addItem = function (file) {
                var loading = createLoader();
                var interval = setInterval(function () {
                    if (!loading.width() || !loading.height()) {
                        return;
                    }
                    clearInterval(interval);
                    queue.push(function () {
                        readFile(file, createImage(loading, file, loading.width(), loading.height(), processNext));
                    });
                    if (!running) {
                        processNext();
                    }
                }, 250);
            };
            for(var i = 0; i < l; i++) {
                addItem(files[i]);
            }
        } else {
            fieldset.html('<div class="inline">'+files[0].name+'</div>');
        }
    }
});

$('.share a[data-role="popup"]').on({
    click: function (e) {
        e.preventDefault();
        window.open($(this).attr('href'), "share_popup", "menubar=0,resizable=1,width=350,height=250");
    }
});

$('form').on({
   reset: function () {
       $(this).find('[data-role="get-profile-github"]').each(function () {
           var target = $('#' + $(this).data('list-target'));
           target.find('option, optgroup').remove();
           target.closest('.field').addClass('hidden');
       });
   }
});

$('[data-role="auto-name"]').each(function () {
    var self = $(this);
    var src = $('#' + self.data('src'));
    src.on({
        change: function () {
            if (self.val() != '' && !self.data('autogenerated')) {
                return;
            }
            var src_val = src.val();
            if (!src_val) {
                src_val = '';
            }
            self.val(
                src_val.split("/", 2).last().replace(/JobTest|Job Test/g, '').replace(/[_-]/g, ' ').split(' ').map(function (str) {
                    return str.trim().ucfirst();
                }).join(' ')
            );
            self.data('autogenerated', true);
        }
    });
    self.on({
       keypress: function () {
           self.data('autogenerated', false);
       },
       click: function () {
            self.data('autogenerated', false);
       }
    });
    src.trigger('change');
});