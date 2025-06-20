import requests
import os

def download_openweathermap_icons(output_dir="weather_icons"):
    """
    Downloads all available OpenWeatherMap icons to a specified directory.

    Args:
        output_dir (str): The directory where icons will be saved.
                          Defaults to "weather_icons".
    """
    base_url = "https://openweathermap.org/img/wn/"
    # List of all possible OpenWeatherMap icon codes (day and night)
    icon_codes = [
        "01d", "01n",  # clear sky
        "02d", "02n",  # few clouds
        "03d", "03n",  # scattered clouds
        "04d", "04n",  # broken clouds
        "09d", "09n",  # shower rain
        "10d", "10n",  # rain
        "11d", "11n",  # thunderstorm
        "13d", "13n",  # snow
        "50d", "50n"   # mist
    ]

    # Create the output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created directory: {output_dir}")

    print(f"Starting download of OpenWeatherMap icons to '{output_dir}'...")

    for code in icon_codes:
        icon_filename = f"{code}@2x.png"
        icon_url = f"{base_url}{icon_filename}"
        file_path = os.path.join(output_dir, icon_filename)

        try:
            # Send an HTTP GET request to download the image
            response = requests.get(icon_url, stream=True)
            response.raise_for_status()  # Raise an HTTPError for bad responses (4xx or 5xx)

            # Save the image content to a file
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"Downloaded: {icon_filename}")

        except requests.exceptions.RequestException as e:
            print(f"Error downloading {icon_filename} from {icon_url}: {e}")
        except IOError as e:
            print(f"Error saving {icon_filename} to {file_path}: {e}")

    print("Download process complete.")

if __name__ == "__main__":
    download_openweathermap_icons()
