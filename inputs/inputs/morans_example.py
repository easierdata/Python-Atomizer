"""
Used the following resources for reference

https://pysal.org/esda/generated/esda.Moran.html
https://pysal.org/notebooks/viz/splot/esda_morans_viz.html
"""

import libpysal
from esda.moran import Moran
from splot.esda import moran_scatterplot
import matplotlib.pyplot as plt
import numpy as np

def main():
    w = libpysal.io.open(libpysal.examples.get_path("stl.gal")).read()
    f = libpysal.io.open(libpysal.examples.get_path("stl_hom.txt"))
    y = np.array(f.by_col['HR8893'])
    mi = Moran(y, w)
    print(round(mi.I, 3))

    fig, ax = moran_scatterplot(mi, aspect_equal=True)
    plt.show()

main()