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

        var data = self.data();
        request.data[self.data('query-name')] = self.val();
        for (var k in data) {
            if (k.indexOf('param-') == 0) {
                request.data[k.substr(6)] = data[k];
            }
        }
        console.log(request);

        $.ajax(request);
    }
});
