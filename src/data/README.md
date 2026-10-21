Country and subdivision names are generated from
[country-region-data](https://github.com/country-regions/country-region-data),
version 4.1.0 (MIT license), with `npm run build:registration-data`.
The generator keeps the country list and Nigeria's states in the client bundle;
other subdivision lists are static files loaded on demand from `public/data/states`.
