/**
 * Created by mekdr on 12/27/2016.
 */

window.jobtestvault = {
    onLoadLinkedIn: function () {
        if (IN.User.isAuthorized()) {
            $('[data-role="get-profile-linkedin"] button').trigger('click');
        }
    },
    showDialog: function (title, html, modal, onEvent) {
        var dialog = $('<dialog><h2><a class="closer" data-role="close" href="#" tabIndex="-1" aria-hidden="true"></a>'+title+'</h2><div class="content"><form method="dialog">'+html+'</form></div></dialog>');
        dialog.on({
           close:  function () {
               if (onEvent && onEvent.close) {
                   onEvent.close(dialog.get(0).returnValue);
               }
               dialog.remove();
           },
           cancel: function () {
               if (onEvent && onEvent.cancel) {
                   onEvent.cancel();
               }
               dialog.remove();
           }
        });
        $('[data-role="close"]', dialog).on({
            click: function (e) {
                e.preventDefault();
                dialog.get(0).close();
            }
        });
        $('body').append(dialog);
        if (modal) {
            dialog.get(0).showModal();
        } else {
            dialog.get(0).show();
        }
        $('button', dialog).first().focus();
    },
    showInfoDialog: function (title, html, modal, onEvent) {
        window.jobtestvault.showDialog('<i class="fa fa-info-circle" aria-hidden="true"></i> ' + title, '<div>' + html + '</div><div class="buttons"><button data-role="close">OK</button></div>', modal, onEvent)
    },
    showErrorDialog: function (title, html, modal, onEvent) {
        window.jobtestvault.showDialog('<i class="fa fa-exclamation-circle" aria-hidden="true"></i> ' + title, '<div>' + html + '</div><div class="buttons"><button data-role="close">OK</button></div>', modal, onEvent)
    },
    confirm: function (title, html, buttons, modal, onEvent) {
        if (!buttons) {
            buttons = [
              "OK",
              "Cancel"
            ];
        }
        var buttons_rendered = buttons.map(function (button_data) {
            return '<button name="action" value="'+button_data.toLowerCase()+'" type="submit">'+button_data+'</button>';
        }).join('');
        window.jobtestvault.showDialog('<i class="fa fa-info-circle" aria-hidden="true"></i> ' + title, '<div>' + html + '</div><div class="buttons">'+buttons_rendered+'</div>', modal, onEvent);
    }
};