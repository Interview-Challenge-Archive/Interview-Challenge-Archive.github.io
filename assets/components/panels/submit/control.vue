<template>
    <div class="inner split">
        <div>
            <section>
                <h2>Submit your work</h2>
                <p>
                    If you ever did a test for a job you can submit into our database here by filling the form.

                    Just few notes before you do so:
                <ul>
                    <li>
                        Make sure you haven't signed any NDA to not publish your test.
                    </li>
                    <li>
                        Make sure that all your files doesn't have parts that can cause any legal issues.
                    </li>
                    <li>
                        You need create a git repository on <a href="http://github.com">GitHub</a> first.
                    </li>
                    <li>
                        You should place there all your files.
                    </li>
                    <li>
                        Once you fill the form and submit, your repository will be forked to <a
                            href="https://github.com/JobTestVault" target="_blank">JobTestVault organization</a>.
                    </li>
                </ul>
                </p>
            </section>
        </div>
        <div>
            <section>
                <h2>Fill the form</h2>
                <form action="#" method="post">
                    <github_profile_field></github_profile_field>
                    <div class="field multiple hidden">
                        <select id="repositories_list" name="repository">

                        </select>
                    </div>
                    <div class="field">
                        <auto_name_field linkedId="repositories_list" name="name" placeholder="Project name"
                                         type="text"/>
                    </div>
                    <file_uploader
                            :multiple="true"
                            accept="image/png,image/jpeg,image/gif"
                            class="field"
                            name="screenshot[]"
                            placeholder="Select screenshot file(s)"
                    />
                    <file_uploader
                            :multiple="false"
                            accept="text/markdown,text/plain,LICENSE"
                            class="field"
                            name="license[]"
                            placeholder="Select license file"
                    />
                    <div class="field multiple" data-role="get-profile-linkedin">
                        <linkedin_profile_field api_key="86r27rp7dsyn12" name="linkedin"/>
                    </div>
                    <div class="field half first">
                        <input_autocomplete
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
                    <div class="field first half">
                        <select name="result_from_employer">
                            <option value="0">No feedback from employer</option>
                            <option value="1">Good feedback and invited to next interview/got job offer</option>
                            <option value="2">Good feedback but not invited to next interview</option>
                            <option value="3">Bad feedback but invited to next interview/got job offer</option>
                            <option value="4">Bad feedback and not invited to next interview</option>
                        </select>
                    </div>
                    <div class="field half">
                        <input id="completed_checkbox" name="completed" type="checkbox" value="yes"/>
                        <label for="completed_checkbox">Fully completed task?</label>
                    </div>
                    <div class="field">
                        <textarea id="description" name="description" placeholder="Description" rows="4"></textarea>
                    </div>
                    <ul class="actions">
                        <li><input class="special" type="submit" value="Send"/></li>
                        <li><input type="reset" value="Reset"/></li>
                    </ul>
                </form>
            </section>
        </div>
    </div>
</template>

<script>
    import {loadControl} from '../../../js/loaders';

    export default {
        components: {
            input_autocomplete: loadControl('input_autocomplete'),
            linkedin_profile_field: loadControl('linkedin_profile_field'),
            file_uploader: loadControl('file_uploader'),
            github_profile_field: loadControl('github_profile_field'),
            auto_name_field: loadControl('auto_name_field')
        }
    }
</script>