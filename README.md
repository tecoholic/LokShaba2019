# LokShaba2019

## Data Source

Data for this analysis has been taken from [Election Commission of India](http://results.eci.gov.in/pc/en/constituencywise/ConstituencywiseS227.htm?ac=7)

## Development

Copy the data from Election commission of India site to `LokShaba 2019 TN Candidate Vote Shares.ods` file


Install the dependencies using

    npm i
    
Run the data generate,

    node index.js
    
You can see that `formatted_data.json` and `party_data.json` gets generate in `docs/data/`

Once you've the file with you, cd in to `docs/`

    python -m SimpleHTTPServer

 
## Requirements

* Nodejs > 8





