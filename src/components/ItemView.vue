<template>
    <v-container>
        <v-row align="center" justify="center">
            <v-col cols="auto" v-for="( item, i ) in  zipCodeInfo" :key="i">
                <v-card class="mx-auto bg-indigo" max-width="344">
                    <v-card-item v-for="( value, key ) in  item " :key="key">
                        <div>
                            <div class="text-overline mb-1">{{ key }}</div>
                            <div class="text-h6 mb-1"> {{ value }} </div>
                        </div>
                    </v-card-item>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    data() {
        return {
            context: {},
            settings: {},
            itemId: null,
            boardId: null,
            zipCodeInfo: {},
            zipCodeValue: null,
            zipCodeColumnId: null,
            countryCodeValue: null,
            countryColumnId: 'country',
        };
    },
    mounted() {
        this.setupMondayListeners();
    },
    methods: {
        setupMondayListeners() {
            this.monday.listen("context", this.handleContextChange);
            this.monday.listen("settings", this.handleSettingsChange);
        },
        handleContextChange(res) {
            this.context = res.data;
            this.boardId = this.context.boardId;
            this.itemId = this.context.itemId;
        },
        handleSettingsChange(res) {
            this.settings = res.data;
            this.zipCodeColumnId = Object.keys(res.data.zipCode)[0] || null;

            if (!this.zipCodeColumnId) {
                this.monday.execute("notice", {
                    message: `Please select the zip code column in the settings.`,
                    type: "error",
                    timeout: 10000
                });
                return;
            }

            this.getCountryAndZipCodeValue();
        },
        async getCountryAndZipCodeValue() {
            try {
                const query = `query { items (ids: ${this.itemId}) { column_values (ids:["${this.countryColumnId}","${this.zipCodeColumnId}"]) { id value } } }`;
                const response = await this.monday.api(query);

                const countryValue = response.data.items[0]?.column_values.find(col => col.id === this.countryColumnId)?.value || null;
                const zipCodeValue = response.data.items[0]?.column_values.find(col => col.id === this.zipCodeColumnId)?.value || null;

                this.zipCodeValue = zipCodeValue ? JSON.parse(zipCodeValue) : null;
                this.countryCodeValue = countryValue ? JSON.parse(countryValue)?.countryCode : null;

                if (!this.zipCodeValue) {
                    this.monday.execute("notice", {
                        message: `Please enter the zip code in the item.`,
                        type: "error",
                        timeout: 10000
                    });
                    return;
                }

                if (!this.countryCodeValue) {
                    this.monday.execute("notice", {
                        message: `Please select the country in the item.`,
                        type: "error",
                        timeout: 10000
                    });
                    return;
                }

                this.getZipCodeInfo();
            } catch (err) {
                this.handleError(err);
            }
        },
        async getZipCodeInfo() {
            try {
                const response = await fetch(`https://api.zippopotam.us/${this.countryCodeValue}/${this.zipCodeValue}`);

                if (response.status !== 200) {
                    this.monday.execute("notice", {
                        message: `${this.zipCodeValue} zip code doesn't exist for ${this.countryCodeValue} country`,
                        type: "error",
                        timeout: 10000
                    });
                    return;
                }

                const data = await response.json();
                this.zipCodeInfo = data.places;
            } catch (err) {
                this.handleError(err);
            }
        },
        handleError(err) {
            console.error(`Error:`, err);
        },
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    display: inline-block;
    margin: 0 10px;
}

a {
    color: #42b983;
}
</style>
