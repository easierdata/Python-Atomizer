"""
@file helper.py

This file will convert the encoded profile dump to something readable
"""

import os
import pstats
import json
import os

# Create tmp directory
if not os.path.exists("scripts/tmp"):
    os.makedirs("scripts/tmp")

# Read the encoded profile
stats = pstats.Stats('inputs/profile')
functions = {}
#stats.print_stats()

# Dump imported functions
imports_dump = open('scripts/tmp/secondary_definitions.json')
data = json.load(imports_dump)
keywords = ["inputs"]

def extract_by_keyword(keyword: str):
    for key in stats.stats.keys():
        function_name = key[2]
        filename = key[0]
        line_number = key[1]

        if keyword in filename or keyword in function_name:
            # Check if the filename is an absolute path or a relative path
            if os.path.isabs(filename):
                # If the filename is an absolute path, use it as is
                full_filename = filename
            else:
                # Create full path using the current working directory
                full_filename = os.path.join(os.getcwd(), filename)

            # Skip if function is built into python or compiled bytecode
            if function_name.find(">") != -1 or full_filename.find(">") != -1:
                continue
            else:
                # Add function details to dictionary
                if function_name not in functions:
                    functions[function_name] = []
                functions[function_name].append((full_filename, line_number))

            with open('scripts/tmp/primary_functions.json', 'w') as contents:
                json.dump(functions, contents)

for key in data:
    # Skip if no imports
    if len(data[key]) == 0:
        continue

    imports = data[key]
    for obj in imports:
        for names in obj['names']:
            keywords.append(names.split(' as ')[0].split('.')[-1])

imports_dump.close()

for kw in keywords:
    extract_by_keyword(kw)

