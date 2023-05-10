def perimeter(p1, p2, p3, p4):
    # Calculate the lengths of each side
    side1 = ((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2)**0.5
    side2 = ((p3[0]-p2[0])**2 + (p3[1]-p2[1])**2)**0.5
    side3 = ((p4[0]-p3[0])**2 + (p4[1]-p3[1])**2)**0.5
    side4 = ((p1[0]-p4[0])**2 + (p1[1]-p4[1])**2)**0.5

    # Calculate the perimeter
    perimeter = side1 + side2 + side3 + side4

    return perimeter