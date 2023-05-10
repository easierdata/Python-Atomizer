def area(p1, p2, p3, p4):
    # Calculate the vectors between the points
    v1 = [p2[0] - p1[0], p2[1] - p1[1]]
    v2 = [p3[0] - p2[0], p3[1] - p2[1]]
    v3 = [p4[0] - p3[0], p4[1] - p3[1]]
    v4 = [p1[0] - p4[0], p1[1] - p4[1]]

    # Calculate the lengths of the diagonals
    d1 = (v1[0] ** 2 + v1[1] ** 2) ** 0.5
    d2 = (v2[0] ** 2 + v2[1] ** 2) ** 0.5

    # Calculate the area using the formula for a trapezium
    area = 0.5 * (d1 + d2) * ((v1[0] * v2[1]) - (v1[1] * v2[0]))
    area = abs(area)

    return area