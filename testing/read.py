import os
import pstats
import json

# Read the encoded profile
stats = pstats.Stats('profile2')
functions = {}
stats.print_stats()