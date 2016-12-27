/**
 * Created by mekdr on 12/27/2016.
 */

window.jobtestvault = {
    onLoadLinkedIn: function () {
        if (IN.User.isAuthorized()) {
            $('[data-role="get-profile-linkedin"] button').trigger('click');
        }
    }
};