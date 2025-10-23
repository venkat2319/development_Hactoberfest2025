#for 2024 game
#Data Structure:
#Use a 2D array (4x4) to represent the board.

#Move Logic:
#When sliding, first compress tiles to remove gaps, then merge equal adjacent tiles, then compress again.

#Random Tile Spawn:
#After each move, spawn a new tile (2 or 4) in a random empty spot.

#Check Game Over:
#The game ends when no moves are possible (no empty tiles and no adjacent equal tiles).

#User Interface:
#You can do a text-based version with print statements or use libraries like pygame for graphics.


import random

SIZE = 4

def new_board():
    board = [[0] * SIZE for _ in range(SIZE)]
    add_new_tile(board)
    add_new_tile(board)
    return board

def add_new_tile(board):
    empty = [(r, c) for r in range(SIZE) for c in range(SIZE) if board[r][c] == 0]
    if empty:
        r, c = random.choice(empty)
        board[r][c] = 4 if random.random() < 0.1 else 2

def print_board(board):
    for row in board:
        print('\t'.join(str(num) if num != 0 else '.' for num in row))
    print()

def slide_and_merge(row):
    new_row = [num for num in row if num != 0]
    i = 0
    while i < len(new_row) - 1:
        if new_row[i] == new_row[i+1]:
            new_row[i] *= 2
            new_row[i+1] = 0
            i += 2
        else:
            i += 1
    new_row = [num for num in new_row if num != 0]
    new_row += [0] * (SIZE - len(new_row))
    return new_row

def move_left(board):
    new_board = []
    for row in board:
        new_board.append(slide_and_merge(row))
    return new_board

def transpose(board):
    return [list(row) for row in zip(*board)]

def move_right(board):
    return [list(reversed(slide_and_merge(list(reversed(row))))) for row in board]

def move_up(board):
    transposed = transpose(board)
    moved = move_left(transposed)
    return transpose(moved)

def move_down(board):
    transposed = transpose(board)
    moved = move_right(transposed)
    return transpose(moved)

def board_changed(old, new):
    return any(old[r][c] != new[r][c] for r in range(SIZE) for c in range(SIZE))

def is_game_over(board):
    if any(0 in row for row in board):
        return False
    for r in range(SIZE):
        for c in range(SIZE-1):
            if board[r][c] == board[r][c+1]:
                return False
    for c in range(SIZE):
        for r in range(SIZE-1):
            if board[r][c] == board[r+1][c]:
                return False
    return True

def main():
    board = new_board()
    print_board(board)

    while True:
        move = input("Move (w/a/s/d): ").lower()
        if move not in ['w', 'a', 's', 'd']:
            print("Invalid move! Use w/a/s/d.")
            continue

        if move == 'a':
            new_board_state = move_left(board)
        elif move == 'd':
            new_board_state = move_right(board)
        elif move == 'w':
            new_board_state = move_up(board)
        else:
            new_board_state = move_down(board)

        if board_changed(board, new_board_state):
            board = new_board_state
            add_new_tile(board)
            print_board(board)

            if is_game_over(board):
                print("Game Over!")
                break
        else:
            print("No tiles moved. Try a different direction.")

if __name__ == "__main__":
    main()
