<template>
    <div class="inner split">
        <div>
            <section>
                <h2>Search by</h2>
                <form action="#" data-role="search" data-search-url-view="search_url"
                      data-share-links-zone="search_share"
                      method="get">
                    <div class="field half first">
                        <input_autocomplete
                                dataKey="name"
                                dataMethod="GET"
                                dataSource="https://restcountries.eu/rest/v1/all"
                                name="country"
                                placeholder="Country"
                        />
                    </div>
                    <div class="field half">
                        <input name="company" placeholder="Company" type="search"/>
                    </div>
                    <div class="field half first">
                        <input name="position" placeholder="Position" type="search"/>
                    </div>
                    <div class="field half">
                        <input_autocomplete
                                dataKey="English"
                                dataMethod="GET"
                                dataSource="https://data.okfn.org/data/core/language-codes/r/language-codes-full.json"
                                name="project_language"
                                placeholder="Project language"
                        />
                    </div>
                    <div class="field half first">
                        <input_autocomplete
                                :dataSource="'https://api.github.com/search/users?q=' + value"
                                dataKey="login"
                                name="github_username"
                                placeholder="GitHub Username"
                        />
                    </div>
                    <div class="field half">
                        <input name="project_name" placeholder="Project name" type="search"/>
                    </div>
                    <ul class="actions">
                        <li><input class="special" type="submit" value="Search"/></li>
                        <li><input type="reset" value="Reset"/></li>
                    </ul>
                </form>
            </section>
        </div>
        <div>
            <section>
                <h2>Generate a link</h2>
                <p>Here you can get a link to share for current search:
                    <copy_to_clipboard_field ref="search_url" value="http://"></copy_to_clipboard_field>
                </p>
            </section>
            <h2>Share a link</h2>
            <share_links ref="search_share"></share_links>
        </div>
    </div>
</template>

<script>
    import {loadControl} from '../../../js/loaders';

    export const TITLE = 'Search';
    export const ICON_CLASS = 'fa fa-search';

    export default {
        components: {
            input_autocomplete: loadControl('input_autocomplete'),
            share_links: loadControl('share_links'),
            copy_to_clipboard_field: loadControl('copy_to_clipboard_field')
        }
    }
</script>