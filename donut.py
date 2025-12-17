import math
import time
import os

A = 0
B = 0

while True:
    os.system("cls" if os.name == "nt" else "clear")
    z = [0] * 1760
    b = [" "] * 1760

    for j in [i * 0.07 for i in range(0, 90)]:
        for i in [i * 0.02 for i in range(0, 314)]:
            sini = math.sin(i)
            cosi = math.cos(i)
            sinj = math.sin(j)
            cosj = math.cos(j)

            sinA = math.sin(A)
            cosA = math.cos(A)
            sinB = math.sin(B)
            cosB = math.cos(B)

            h = cosj + 2
            D = 1 / (sini * h * sinA + sinj * cosA + 5)
            t = sini * h * cosA - sinj * sinA

            x = int(40 + 30 * D * (cosi * h * cosB - t * sinB))
            y = int(12 + 15 * D * (cosi * h * sinB + t * cosB))
            o = x + 80 * y

            N = int(
                8 * (
                    (sinj * sinA - sini * cosj * cosA) * cosB
                    - sini * cosj * sinA
                    - sinj * cosA
                    - cosi * cosj * sinB
                )
            )

            if 0 <= o < 1760 and D > z[o]:
                z[o] = D
                b[o] = ".,-~:;=!*#$@"[max(N, 0)]

    print("".join(b[i] if i % 80 else "\n" for i in range(1760)))
    A += 0.04
    B += 0.02
    time.sleep(0.03) 