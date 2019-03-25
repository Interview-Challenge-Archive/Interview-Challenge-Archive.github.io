<template>
    <div class="inner split">
        <div>
            <section>
                <h2>OK, so what is this?</h2>
                <p>
                    This is a place to show what tests for getting a job looks like in different companies and for
                    different positions. You can either see same such examples here or share own.
                </p>
                <p>
                    Every example that can be found here is <a
                        href="https://github.com/JobTestVault/jobtestvault.github.io" target="_blank">hosted</a> on
                    <a href="https://github.com" target="_blank">GitHub</a>. So everyone who would like can
                    contribute or use the code elsewhere.
                </p>
            </section>

        </div>
        <div>
            <section>
                <h2>Share this website</h2>
                <share_links message="You should visit JobTestVault for some interesting job tests examples too!"
                             url="http://bit.ly/2hfiU2n"></share_links>
            </section>
            <p class="copyright">
                &copy; Job Test Vault. Design: <a href="http://html5up.net">HTML5 UP</a>.
            </p>
        </div>
    </div>
</template>

<script>
    import {loadControl} from '../../../js/loaders';

    export default {
        components: {
            share_links: loadControl('share_links'),
        }
    }
</script>