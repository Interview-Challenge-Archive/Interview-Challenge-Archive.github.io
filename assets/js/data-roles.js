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