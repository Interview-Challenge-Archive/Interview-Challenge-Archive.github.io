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
        $('body .panel.active:first').append(dialog);
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