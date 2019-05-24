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
      percentage_total_vote: parseFloat(row['% of Votes']),
    });

  });

  const constituencyWise = jsonDump.filter(item => item.constituency === constituency);

  constituencyWise.sort((party1, party2) => {
    return party2.total_vote_count - party1.total_vote_count;
  });

  const winningParty = constituencyWise[0];
  const runnerParty = constituencyWise[1];

  constituencies.push({
    constituency_name: constituency,

    poll_results: constituencyWise,

    candidate_stats: {
      total_contestant: constituencyWise.length,
      total_parties: constituencyWise.filter(item => {
        return item.party_name.toLowerCase() !== 'independent' && item.party_name.toLowerCase() !== 'none of the above';
      }).length,
      total_independent: constituencyWise.filter(item => item.party_name.toLowerCase() === 'independent').length,
      nota: 1
    },

    poll_stats: {
      win_margin: winningParty.total_vote_count - runnerParty.total_vote_count,
      winner_vote_count: winningParty.total_vote_count,
      runner_vote_count: runnerParty.total_vote_count,
      winning_party_name: winningParty.party_name,
      running_party_name: runnerParty.party_name,
      top_5: constituencyWise.slice(0, 4)
    },

    vote_stats: constituencyWise.reduce((acc, value, key) => {

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

