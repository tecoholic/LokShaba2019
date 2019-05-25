$(document).ready(function () {

  function getQueryStringValue(key) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
  }

  var constituencySlug = getQueryStringValue("constituency");
  var $baseTable = $('#table');
  var $constituencyTable = $('#constituencyTable');
  var $titleCard = $('.title-card');

  var $winningCandidate = $('.wc');
  var $winningParty = $('.wp');
  var $constituency = $('.constituency');

  if (constituencySlug) {
    document.title = constituencySlug + ' Lok Shabha 2019';
    $baseTable.hide();
    $constituencyTable.show();
    $titleCard.show();
  } else {
    $baseTable.show();
    $constituencyTable.hide();
    $titleCard.hide();
  }

  $baseTable.bootstrapTable({
    url: 'data/formatted_data.json',
    search: false,
    columns: [{
      field: 'constituency_name',
      title: 'Constituency',
      searchable: true,
      sortable: "true",
      formatter: function (value, row) {
        return `<a href="?constituency=${row.constituency_slug}">${value}</a>`
      }
    }, {
      field: 'poll_stats.winning_candidate_name',
      title: 'Candidate Name',
      searchable: true
    }, {
      field: 'poll_stats.winning_party_name',
      title: 'Winner Party',
      sortable: "true",
      searchable: false
    }, {
      field: 'candidate_stats.total_parties',
      title: 'Total party candidates',
      sortable: "true",
      searchable: false
    }, {
      field: 'candidate_stats.total_independent',
      title: 'Total independent',
      sortable: "true",
      searchable: false
    }, {
      field: 'candidate_stats.total_contestant',
      title: 'Total candidates',
      sortable: "true",
      searchable: false
    }, {
      field: 'poll_stats.win_margin',
      title: 'Winning margin(in votes)',
      sortable: "true",
      searchable: false
    }, {
      field: 'poll_stats.winner_vote_count',
      title: 'Winning vote count',
      sortable: "true",
      searchable: false
    }, {
      field: 'vote_stats.total_vote_count',
      title: 'Total votes casted',
      sortable: "true",
      searchable: false
    }, {
      field: 'poll_stats.winning_vote_percent',
      title: 'Winner vote in %',
      sortable: "true",
      searchable: false
    }]
  });

  $constituencyTable.bootstrapTable({
    url: 'data/formatted_data.json',
    search: false,
    columns: [{
      field: 'no',
      title: 'no',
      formatter: function (cell, row, enumObject, index) {
        return enumObject + 1;
      }
    }, {
      field: 'candidate_name',
      title: 'Candidate Name',
      search: true,
      searchable: true
    }, {
      field: 'party_name',
      title: 'Party Name',
      sortable: "true",
      searchable: false
    }, {
      field: 'evm_vote_count',
      title: 'EVM Vote Count',
      sortable: "true",
      searchable: false
    }, {
      field: 'postal_vote_count',
      title: 'Postal Vote Count',
      sortable: "true",
      searchable: false
    }, {
      field: 'total_vote_count',
      title: 'Total Vote Count',
      sortable: "true",
      searchable: false
    }, {
      field: 'percentage_total_vote',
      title: 'Total % of vote',
      sortable: "true",
      searchable: false
    }],
    rowStyle: function (row, index) {
      if (index === 0) {
        return {
          classes: 'first-item'
        };
        //     background-colo2r: greenyellow;
      } else if (index === 1) {
        return {
          classes: 'second-item'
        } //    background-color: bisque;
      } else if (index >= 2 && index <= 4) {
        return {
          classes: 'others'
        };
      } else {
        return '';
      }
    },
    responseHandler: function (dump) {
      if (!constituencySlug) {
        return dump;
      }
      var data = dump.find(function (item) {
        return item.constituency_slug === constituencySlug;
      });
      $winningCandidate.html(data.poll_stats.winning_candidate_name);
      $winningParty.html(data.poll_stats.winning_party_name);
      $constituency.html(data.constituency_name);
      return data.poll_results;
    }
  });

});


