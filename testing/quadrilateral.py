"""
Calculates the area of a quadrilateral

1. Generate 4 points with rng and store in variables
2. Calculate area
3. Calculate perimeter
4. Display results
"""

# import zipapp
# import zipfile
from scripts.randomPointsGenerator import randomPointGenerator
from scripts.area import area
from scripts.perimeter import perimeter
from math import pi, radians

def main():
    point_a = randomPointGenerator()
    point_b = randomPointGenerator()
    point_c = randomPointGenerator()
    point_d = randomPointGenerator()

    shape_area = area(point_a, point_b, point_c, point_d) 
    shape_perimeter = perimeter(point_a, point_b, point_c, point_d)

    print("Area: " + str(shape_area))
    print("Perimeter: " + str(shape_perimeter))
    print(pi)
    print(radians(180))

main()