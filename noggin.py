import streamlit as st
import time
import random

# st.set_page_config(layout="wide")

# Function to generate two random letters
def generate_letters():
    letters = [chr(random.randint(65, 90)) for _ in range(2)]  # Generates two random uppercase letters
    return letters

# Function to randomly select an action
def select_action():
    actions = ["<div style='font-size: 70px; text-align: center;'><span style='color: blue; font-size: 100px;'>B</span>OOKEN<span style='color: blue; font-size: 100px;'>D</span></div>",
               "<div style='font-size: 70px; text-align: center;'>MI<span style='color: orange; font-size:  100px;'>DD</span>LE LETTERS</div>",
               "<div style='font-size: 70px; text-align: center;'><span style='color: green;'>INITIALS</span></div>",
               "<div style='font-size: 70px; text-align: center;'><span style='color: red;'>NEITHER LETTER</span></div>",
               "<div style='font-size: 70px; text-align: center;'><span style='color: pink;'>WORD ASSOCIATION</span></div>",
               "<div style='font-size: 70px; text-align: center;'><span style='color: cyan;'>WORD DISSOCIATION</span></div>",
               "<div style='font-size: 70px; text-align: center;'><span style='color: purple;'>DESCRIBE</span></div>"
               ]
    # return actions[0]
    return random.choice(actions)

def main():
    st.title("Noggin Dupe 🤫😉")

    with st.sidebar:
        with st.expander("DESCRIBE"):
            st.write('Players must use one adjective and one noun starting with each of the letter to accurately describe something. For example, if the letters are "A" and "B", a player might say "Amazing Bear".')
        with st.expander("BOOKEND"):
            st.write('Players must call out a word that starts and ends with both letters shown. For example, if the letters are "A" and "M", a player might say "AlbuM".')
        with st.expander("MIDDLE LETTERS"):
            st.write('Players must call out a word that has both letters somewhere in the middle. For example, if the letters are "A" and "M", a player might say "orgAnisMs".')
        with st.expander("INITIALS"):
            st.write('Players must call out the name of a celebrity with the initials of the two letters. For example, if the letters are "A" and "M", a player might say "Alyssa Milano".')
        with st.expander("NEITHER LETTER"):
            st.write('Players must call out a word that contains neither letter. For example, if the letters are "A" and "M", a player might say "Bicycle".')
        with st.expander("WORD ASSOCIATION"):
            st.write('Players must call out two words, one starting with each letter, that have an obvious association. For example, if the letters are "A" and "M", a player might say "Ambulance, Medicine".')
        with st.expander("WORD DISSOCIATION"):
            st.write('Players must call out two words, one starting with each letter, that have absolutely no connection at all. For example, if the letters are "A" and "M", a player might say "Apple, Moon".')

    # st.title("Random Letter and Action Generator")

    # st.write("This app generates two random letters and selects a random action.")

    # st.write("Press the 'Generate' button to start.")

    if st.button("Generate"):
        # Clear previous generations
        st.empty()

        letters = generate_letters()
        action = select_action()

        col1, col2 = st.columns(2)

        with col1:
            # st.write("Generated Letters:")
            st.markdown(f"<div style='font-size: 250px; display: flex; justify-content: center; align-items: center; text-align: center; border: 12px solid black; padding: 10px; height: 300px; width: 342px;'>{letters[0]}</div>", unsafe_allow_html=True)

        with col2:
            # st.write("Second Letter:")
            st.markdown(f"<div style='font-size: 250px; display: flex; justify-content: center; align-items: center; text-align: center; border: 12px solid black; padding: 10px; height: 300px; width: 342px;'>{letters[1]}</div>", unsafe_allow_html=True)

        # time.sleep(0.5)

        st.write(" ")
        # st.markdown(f"<div style='font-size: 70px; text-align: center; border: 10px solid black; padding: 10px; height: 200px; width: 100%; display: flex; justify-content: center; align-items: center;'>{empty}</div>", unsafe_allow_html=True)
        # time.sleep(1)
        st.markdown(f"<div style='font-size: 70px; text-align: center; border: 10px solid black; padding: 10px; height: 200px; width: 100%; display: flex; justify-content: center; align-items: center;'>{action}</div>", unsafe_allow_html=True)

# Main function to run the app
if __name__ == "__main__":
    main()
