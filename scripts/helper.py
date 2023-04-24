"""
@file helper.py

This file will convert the encoded profile dump to something readable
"""

import os
import pstats
import json

# Read the encoded profile
stats = pstats.Stats('inputs/profile')
functions = {}

# Loop through all the keys in the profile
for key in stats.stats.keys():
    function_name = key[2]
    filename = key[0]
    line_number = key[1]

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

    with open('functions.json', 'w') as contents:
        json.dump(functions, contents)
