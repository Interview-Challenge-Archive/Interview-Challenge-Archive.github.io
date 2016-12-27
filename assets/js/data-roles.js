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
        self.removeAttr('list');
        self.data('loading', true);
        var loader = $('<span class="loading"><i class="fa fa-spinner fa-spin"></i></span>');
        loader.css({
            position: 'relative',
            top: '2.2em',
            left: '90%',
        });
        self.prepend(loader);
        var request = {
            url: self.data('src'),
            cache: self.data('cache') ? self.data('cache') : false,
            data: {},
            crossDomain: self.data('cross-domain') ? self.data('cross-domain') : true,
            method: self.data('method') ? self.data('method') : 'GET',
            success: function (data, textStatus, jqXHR) {
                $('option', datalist).remove();
                var key_to_read = self.data('key');
                for (var i = 0; i < data.total_count; i++) {
                    var item = data.items[i];
                    if (!item || !item[key_to_read]) {
                        continue;
                    }
                    datalist.append("<option value='" + item[key_to_read] + "'>");
                }
                self.attr('list', data_list_id);
                self.data('loading', false);
                loader.remove();
                if (self.data('postponed-loading')) {
                    self.data('postponed-loading', null);
                    self.trigger('keyup');
                }
            }
        };

        if (window.jobtestvault && window.jobtestvault.config && window.jobtestvault.config.github) {
            if (window.jobtestvault.config.github.token) {
                request.password = window.jobtestvault.config.github.token;
            }
            if (window.jobtestvault.config.github.user) {
                request.username = window.jobtestvault.config.github.user;
            }
        }

        var data = self.data();
        for (var k in data) {
            if (k.beginsWith('param')) {
                request.data[k.extractParamNameFromDataName('param')] = data[k];
            }
            if (k.beginsWith('dynParam')) {
                var cmd = data[k].replace('this.', 'self.') + ';';
                request.data[k.extractParamNameFromDataName('dynParam')] = eval(cmd);
            }
        }
        console.log(request);

        $.ajax(request);
    }
});


$('form[data-role="search"]').on({
    'reset': function () {
        $('input[type!="button"][type!="submit"][type!="reset"]', this).val('');
        $('input', this).first().trigger('change');
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
        message = encodeURIComponent(message);
        $('#' + form.data('share-links-zone') + ' [data-href]').each(function () {
            $(this).attr('href', $(this).data('href').replace('{url}', link).replace('{message}', message));
        });
    }
});

$(function () {
    $('form[data-role="search"] input:first-child').change();
});