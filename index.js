'use strict';

const _ = require('lodash');
const fs = require('fs');
const xlsx = require('xlsx');


const excelsheet = xlsx.readFile('./LokShaba 2019 TN Candidate Vote Shares.ods', {
  type: 'file'
});

let jsonDump = [];
let constituencies = [];

_.each(excelsheet.Sheets, (sheet, constituency) => {

  if (constituency === 'Collated') {
    return; // for report generation
  }

  console.log('constituency => ', constituency);

  _.each(xlsx.utils.sheet_to_json(sheet), (row) => {
    let serialNo = row['O.S.N.'];
    if (!serialNo) {
      // serialNo will be undefined for total
      return;
    }

    jsonDump.push({
      no: serialNo,
      constituency,
      candidate_name: row['Candidate'],
      party_name: row['Party'],
      evm_vote_count: parseInt(row['EVM Votes']),
      postal_vote_count: parseInt(row['Postal Votes']),
      total_vote_count: parseInt(row['Total Votes']),
      percentage_total_vote: parseInt(row['% of Votes']),
    });

  });

  const constituencyWise = jsonDump.filter(item => item.constituency === constituency)

  constituencies.push({
    constituency_name: constituency,

    poll_results: constituencyWise,

    total_candidates: constituencyWise.length,

    stats: constituencyWise.reduce((acc, value, key) => {

      acc.evm_vote_count = acc.evm_vote_count + value.evm_vote_count;
      acc.postal_vote_count = acc.postal_vote_count + value.postal_vote_count;
      acc.total_vote_count = acc.total_vote_count + value.total_vote_count;

      return acc;
    }, {
      evm_vote_count: 0,
      postal_vote_count: 0,
      total_vote_count: 0
    }),
  });

});


fs.writeFile("formatted_data.json", JSON.stringify(constituencies), (err) => {
  if (err) {
    console.log(err);
    process.exit(0);
  }
  console.log("Successfully Written to File.");
});

