import tkinter as tk
from tkinter import font
import math


# Button layout: (label, row, col, colspan)
BUTTON_LAYOUT = [
    ('C',  1, 0, 1), ('√', 1, 1, 1), ('%', 1, 2, 1), ('/',  1, 3, 1),
    ('7',  2, 0, 1), ('8', 2, 1, 1), ('9', 2, 2, 1), ('*',  2, 3, 1),
    ('4',  3, 0, 1), ('5', 3, 1, 1), ('6', 3, 2, 1), ('-',  3, 3, 1),
    ('1',  4, 0, 1), ('2', 4, 1, 1), ('3', 4, 2, 1), ('+',  4, 3, 1),
    ('0',  5, 0, 2), ('.',  5, 2, 1), ('=', 5, 3, 1),
]


class Calculator(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("Calculator")
        self.geometry("350x500")
        self.resizable(False, False)

        self.expression   = ""
        self.result_shown = False

        # Fonts
        self.display_font = font.Font(family="Helvetica", size=32, weight="bold")
        self.button_font  = font.Font(family="Helvetica", size=14)

        self.create_widgets()
        self.bind_keys()

    # ── Widgets ──────────────────────────────────────────────────────────────

    def create_widgets(self):
        # Display
        self.display_frame = tk.Frame(self, padx=10, pady=20)
        self.display_frame.pack(expand=True, fill="both")

        self.display_label = tk.Label(
            self.display_frame,
            text="0",
            anchor="e",
            font=self.display_font,
            padx=10
        )
        self.display_label.pack(expand=True, fill="both")

        # Buttons
        self.buttons_frame = tk.Frame(self, padx=5, pady=5)
        self.buttons_frame.pack(expand=True, fill="both")

        # Colour roles
        role_color = {
            'C':  '#ff3b30',
            '/':  '#ff9500',
            '*':  '#ff9500',
            '-':  '#ff9500',
            '+':  '#ff9500',
            '=':  '#2ecc71',
        }

        for label, row, col, colspan in BUTTON_LAYOUT:
            bg = role_color.get(label, '#e0e0e0')
            fg = 'white' if bg != '#e0e0e0' else '#1e1e1e'

            btn = tk.Button(
                self.buttons_frame,
                text=label,
                bg=bg,
                fg=fg,
                font=self.button_font,
                borderwidth=0,
                relief="flat",
                cursor="hand2",
                activebackground='#aaaaaa',
                activeforeground=fg,
                command=lambda t=label: self.on_button_click(t)
            )
            btn.grid(row=row, column=col, columnspan=colspan,
                     sticky="nsew", padx=2, pady=2)
            self.buttons_frame.grid_columnconfigure(col, weight=1)
            self.buttons_frame.grid_rowconfigure(row, weight=1)

    # ── Logic ────────────────────────────────────────────────────────────────

    def on_button_click(self, char):
        if char == 'C':
            self.expression = ""
            self.update_display("0")
        elif char == '=':
            self.calculate()
        elif char == '√':
            self.square_root()
        elif char == '%':
            self.percentage()
        else:
            if self.result_shown:
                self.expression = char if (char.isdigit() or char == '.') else self.expression + char
                self.result_shown = False
            else:
                if self.expression == "" and char in "0./*+":
                    if char == ".":
                        self.expression = "0."
                    elif char != "0":
                        return
                else:
                    self.expression += char
            self.update_display(self.expression)

    def calculate(self):
        try:
            result = eval(self.expression)
            if isinstance(result, float) and result == int(result):
                result = int(result)
            self.expression   = str(result)
            self.result_shown = True
            self.update_display(self.expression)
        except ZeroDivisionError:
            self.update_display("Div/0 Error")
            self.expression = ""
        except Exception:
            self.update_display("Error")
            self.expression = ""

    def square_root(self):
        try:
            if self.expression:
                res = math.sqrt(float(self.expression))
                if res == int(res):
                    res = int(res)
                self.expression   = str(res)
                self.result_shown = True
                self.update_display(self.expression)
        except Exception:
            self.update_display("Error")
            self.expression = ""

    def percentage(self):
        try:
            if self.expression:
                res = float(self.expression) / 100
                self.expression   = str(res)
                self.result_shown = True
                self.update_display(self.expression)
        except Exception:
            self.update_display("Error")
            self.expression = ""

    def update_display(self, text):
        self.display_label.config(text=text[:14])

    # ── Key Bindings ─────────────────────────────────────────────────────────

    def bind_keys(self):
        self.bind('<Return>',    lambda e: self.calculate())
        self.bind('<BackSpace>', lambda e: self.backspace())
        self.bind('<Escape>',    lambda e: self.on_button_click('C'))
        for i in range(10):
            self.bind(str(i), lambda e, d=str(i): self.on_button_click(d))
        for op in ('+', '-', '*', '/', '.'):
            self.bind(op, lambda e, o=op: self.on_button_click(o))

    def backspace(self):
        if not self.result_shown and self.expression:
            self.expression = self.expression[:-1]
            self.update_display(self.expression or "0")


if __name__ == "__main__":
    app = Calculator()
    app.mainloop()
