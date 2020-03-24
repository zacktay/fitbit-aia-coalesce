# README

This is a simple application that finds missing points awarded by AIA using step data from Fitbit.

## Installation

Use npm to install the relevant dependencies.

```bash
npm install
```

## Usage

Export Step Data from Fitbit and place them in the following format YYYY_MM.csv in './static-data'
Copy response obtained from vitality endpoint and update './static-data/AIA_Data.js'

Start the server by running

```bash
npm run devs
```

Exposed endpoints include

- / (default, finds difference for current month and year)
- /:year/:month (finds difference for provided month and year)

## Contributing

Pull requests are welcome.

## License

[MIT](https://choosealicense.com/licenses/mit/)
