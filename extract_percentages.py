import json

with open("docs/data/formatted_data.json", "r") as fp:
    dataset = json.load(fp)

parties = [
    "All India Anna Dravida Munnetra Kazhagam",
    "Communist Party of India",
    "Communist Party of India (Marxist)",
    "Dravida Munnetra Kazhagam",
    "Indian National Congress",
    "Indian Union Muslim League",
    "Viduthalai Chiruthaigal Katchi",
    "Naam Tamilar Katchi",
    "Makkal Needhi Maiam",
    "Pattali Makkal Katchi",
    "Bahujan Samaj Party",
    "Desiya Murpokku Dravida Kazhagam"
]

# 12 Parties in total
collated_percentages = []
for consti in dataset:
    container = {
        "name": consti["constituency_name"],
        "percent": [0]*12
    }
    candidates = consti["poll_results"]
    for can in candidates:
        if can["party_name"] in parties:
            index = parties.index(can["party_name"])
            container["percent"][index] = can["percentage_total_vote"]
    collated_percentages.append(container)

output = {
    "parties": parties,
    "percentages": collated_percentages
}

with open("party_percentages.json", "w") as out:
    json.dump(output, out)
