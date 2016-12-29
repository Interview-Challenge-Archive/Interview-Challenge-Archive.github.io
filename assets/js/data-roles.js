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
            delete i, name, o_name;
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

    var clipboard = new Clipboard($('[data-role="clipboard"]').get(0));
    clipboard.on('success', function (e) {
        window.jobtestvault.showInfoDialog('Clipboard', 'The link was copied to the clipboard!', true);
        e.clearSelection();
    });

    clipboard.on('error', function (e) {
        window.jobtestvault.showErrorDialog('Clipboard', "Your browser doesn't support copy to clipboard command. Try to use manual shortcuts!", true);
    });
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
            //console.log(ret);
            //alert('login');
            //btn.trigger('read');
        }).then(function (ret) {
            btn.trigger('read');
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
            btn.parent().trigger('update_repos_list_available');
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
        target.find('option').remove();
        hello('github').api('/user/orgs').then(function (response) {
            for(var i = 0; i < response.length; i++) {
                var org = response[i];
                hello('github').api('/orgs/'+org.login+'/repos').then(function (response) {
                    var group = $('<optgroup></optgroup>');
                    group.attr('label', org.login.descConcat(org.description));
                    for(var o = 0; o < response.length; o++) {
                        var repo = response[o];
                        var option = $('<option></option>');
                        option.attr('value', repo.full_name.descConcat(repo.description) );
                        group.append(option);
                    }
                    target.append(group);
                });
            }
        });
    }
});

$('[data-role="file-uploader"] button').on({
    click: function () {
        var btn = $(this);
        if (!btn.data('uploader')) {
            var uploader = $('<input type="file">');
            var input = btn.parent().find('input').first();
            uploader.attr('name', input.attr('name') + '_file');
            uploader.css('display', 'none');
            uploader.prop('accept', btn.parent().data('accept'));
            console.log(btn.parent().attr('data-multiple'));
            uploader.attr('multiple', parseInt(btn.parent().data('multiple')) ? true : false);
            uploader.on({
                change: function () {
                    var l = uploader.get(0).files.length;
                    if (l == 0) {
                        input.val('');
                        return;
                    }
                    if (uploader.prop('multiple')) {
                        input.val(l + ' item(s) selected')
                    } else {
                        input.val(uploader.get(0).files[0].name);
                    }
                }
            });
            btn.parent().append(uploader);
            btn.data('uploader', uploader);
        }
        btn.data('uploader').click();
    }
});

$('.share a[data-role="popup"]').on({
    click: function (e) {
        e.preventDefault();
        window.open($(this).attr('href'), "share_popup", "menubar=0,resizable=1,width=350,height=250");
    }
});