import Papa from "papaparse";
import { useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import client from "../../api/client";
import { toast } from "sonner";

// TypeScript augmentation for debug flag
declare global {
  interface Window {
    _normalizeDebugLogged?: boolean;
  }
}

export default function VariantCSVImport() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    
    // First, detect the delimiter by reading a small portion
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const firstLine = text.split('\n')[0];
      
      // Detect delimiter - check for tab first (most common in Excel exports)
      const delimiter = firstLine.includes('\t') ? '\t' : ',';
      
      Papa.parse(file, {
        header: true,
        delimiter: delimiter,
        skipEmptyLines: true,
        preview: 5,
        complete: async (results) => {
          // Normalize preview rows to match backend fields for display
          const normalized = (results.data as any[]).map(normalizeRowForPreview);
          setPreview(normalized as any[]);
        }
      });
    };
    reader.readAsText(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  const onUpload = async () => {
    if (!selectedFile) return toast?.error?.("No file selected");
    setUploading(true); 
    setProgress(0);
    
    // Detect delimiter
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const firstLine = text.split('\n')[0];
        const delimiter = firstLine.includes('\t') ? '\t' : ',';
        
        Papa.parse(selectedFile, {
          header: true,
          delimiter: delimiter,
          skipEmptyLines: true,
          complete: async (results) => {
            try {
              // Normalize rows to backend expected shape
              const raw = results.data as any[];
              const data = raw.map(normalizeRow);

              await client.post('/api/variants/bulk', { data }, {
                onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / (e.total || 1)))
              });
              toast?.success?.('Variants imported');
            } catch (err:any) {
              console.error(err); toast?.error?.('Import failed');
            } finally { setUploading(false); }
          }
        });
      } catch (err: any) {
        console.error(err);
        toast?.error?.('Failed to read file');
        setUploading(false);
      }
    };
    reader.readAsText(selectedFile);
  };

  // Helper: map common CSV column names to backend fields
  const normalizeRow = (row: Record<string, any>) => {
    // Normalize a key: lowercase and remove spaces/underscores/hyphens for flexible matching
    const norm = (k: string) => k.toLowerCase().replace(/[\s_-]+/g, '');

    // Build a normalized lookup for all columns once
    const normalizedRow: Record<string, any> = {};
    Object.keys(row).forEach((k) => {
      normalizedRow[norm(k)] = row[k];
    });

    const get = (keys: string[]) => {
      for (const k of keys) {
        const val = normalizedRow[norm(k)];
        if (val !== undefined && val !== null && val !== '') {
          const str = String(val).trim();
          if (str !== '' && str !== 'null' && str !== 'undefined') return str;
        }
      }
      return undefined;
    };

    // Core variant fields
    const parsePrice = (val?: string) => {
      if (!val) return undefined;
      const cleaned = String(val).replace(/[^0-9.-]/g, '');
      const num = Number(cleaned);
      return isNaN(num) ? undefined : num;
    };
    const modelId = get(["modelId", "model_id", "model", "Model"]);
    const name = get(["name", "variant", "variant_name", "variant name"]);
    const slug = get(["slug", "variant_slug"]);
    const priceRaw = get(["price", "ex_showroom_price", "exShowroomPrice", "ex_showroom_price_1"]);
    const price = parsePrice(priceRaw);
    const exShowroomPrice = price;
    const fuelType = get(["fuelType", "fuel_type", "fuel", "Fuel", "Fuel Type", "fuel-type", "FUEL", "FuelType"]);
    const transmission = get(["transmission", "transmission_type", "Transmission", "gearbox", "Transmission Type"]);
    const engine = get(["engine", "engine_capacity", "Engine", "Engine Capacity", "engine_cc", "displacement"]);
    const mileage = (() => {
      const v = get(["mileage", "mileage_raw", "Mileage"]);
      if (!v) return undefined;
      const num = parseFloat(String(v).replace(/[^0-9.]/g, ''));
      return isNaN(num) ? undefined : num;
    })();
    const seating = (() => {
      const v = get(["seating", "seating_capacity", "seating_capacity_raw", "Seating", "Seating Capacity"]);
      if (!v) return undefined;
      const num = parseInt(String(v).replace(/[^0-9]/g, ''), 10);
      return isNaN(num) ? undefined : num;
    })();
    const colorsRaw = get(["colors", "color", "exterior_colors", "body_colours", "Colors", "Color", "body_colours"]);
    const colors = colorsRaw ? String(colorsRaw).split(/[,;|]/).map((s:any)=>s.trim()).filter(Boolean) : [];

    // Comprehensive specs mapping
    const specs: any = {};
    
    // Overview
    specs.vehicle_overview = get(["vehicle_overview"]);
    specs.description = get(["description", "Description", "variant_description"]);
    specs.summary = get(["summary", "Summary"]);
    specs.brand = get(["brand", "Brand"]);
    specs.model = get(["model", "Model"]);
    specs.variant = get(["variant", "Variant"]);
    
    // Engine
    specs.engine_type = get(["engine_type", "engineType", "Engine Type"]);
    specs.cylinders = get(["cylinders", "Cylinders", "cylinder"]);
    specs.turbocharger = get(["turbocharger", "turbo", "Turbocharger", "turbocharger_supercharger", "turbocharger_supercharger_1"]);
    specs.battery = get(["battery", "Battery"]);
    specs.electric_motor = get(["electric_motor"]);
    specs.emission_standard = get(["emission_standard"]);
    specs.max_power = get(["power", "max_power", "Power", "Max Power", "max_power_1"]);
    specs.max_torque = get(["torque", "max_torque", "Torque", "Max Torque", "max_torque_1"]);
    specs.e20_compatibility = get(["e20_compatibility"]);
    specs.alternate_fuel = get(["alternate_fuel"]);
    specs.fuel_change_over_switch = get(["fuel_change_over_switch"]);
    specs.direct_start_in_cng = get(["direct_start_in_cng"]);
    specs.fuel_tank_capacity = get(["fuel_tank_capacity"]);
    specs.cng_tank_capacity = get(["cng_tank_capacity", "cng_tank_capacity_1"]);
    
    // Performance
    specs.mileage = get(["mileage_raw"]);
    specs.driving_range = get(["driving_range_raw"]);
    specs.idle_start_stop = get(["idle_start_stop"]);
    specs.drivetrain = get(["drivetrain"]);
    specs.four_wheel_drive = get(["four_wheel_drive"]);
    specs.drive_modes_count = get(["drive_modes_count"]);
    specs.terrain_modes_count = get(["terrain_modes_count"]);
    
    // Dimensions & Space
    specs.dimensions_space = get(["dimensions_space"]);
    specs.length = get(["length", "Length", "vehicle_length", "length_mm_raw"]);
    specs.width = get(["width", "Width", "vehicle_width", "width_mm_raw"]);
    specs.height = get(["height", "Height", "vehicle_height", "height_mm_raw"]);
    specs.wheelbase = get(["wheelbase", "Wheelbase", "wheelbase_mm_raw"]);
    specs.ground_clearance = get(["ground_clearance", "groundClearance", "Ground Clearance", "ground_clearance_mm_raw"]);
    specs.kerb_weight = get(["kerb_weight", "kerbWeight", "Kerb Weight", "weight", "kerb_weight_kg_raw"]);
    specs.gross_weight = get(["gross_weight_kg_raw", "gross_vehicle_weight"]);
    specs.seating_capacity = get(["seating_capacity_raw"]);
    specs.no_of_rows = get(["no_of_rows", "number_of_rows"]);
    specs.doors = get(["doors", "number_of_doors"]);
    specs.bootspace = get(["bootspace", "boot_space"]);
    specs.minimum_turning_radius = get(["minimum_turning_radius"]);
    
    // Suspension & Brakes
    specs.front_suspension = get(["front_suspension"]);
    specs.rear_suspension = get(["rear_suspension"]);
    specs.front_brakes = get(["front_brakes"]);
    specs.rear_brakes = get(["rear_brakes"]);
    specs.abs = get(["abs", "ABS", "abs_raw"]);
    specs.ebd = get(["ebd", "EBD", "ebd_raw"]);
    specs.esp = get(["esp", "ESP", "esp_raw"]);
    specs.traction_control = get(["traction_control", "traction_control_raw", "traction_control_system"]);
    specs.brake_sway_control = get(["brake_sway_control"]);
    specs.hill_hold_control = get(["hill_hold_control", "hill_hold_control_raw"]);
    specs.hill_descent_control = get(["hill_descent_control"]);
    specs.steering_type = get(["steering_type"]);
    
    // Exterior Design
    specs.exterior_design = get(["exterior_design"]);
    specs.sunroof = get(["sunroof", "sunroof_moonroof"]);
    specs.spoiler = get(["spoiler"]);
    specs.roof_rails = get(["roof_rails"]);
    specs.grille = get(["grille", "grille_design"]);
    specs.bumpers = get(["bumpers", "body_coloured_bumpers"]);
    specs.antenna = get(["antenna", "antenna_type"]);
    specs.chrome_finish_exhaust_pipe = get(["chrome_finish_exhaust_pipe"]);
    specs.exterior_door_handles_finish = get(["exterior_door_handles_finish"]);
    specs.wheels = get(["wheels"]);
    specs.tyre_size = get(["tyre_size", "tyre_size_1"]);
    specs.tyre_construction = get(["tyre_construction"]);
    specs.chassis_type = get(["chassis_type"]);
    
    // Safety & Security
    specs.ncap_rating = get(["ncap_rating_raw"]);
    specs.airbags = get(["airbags", "Airbags", "no_of_airbags", "airbags_raw"]);
    specs.seatbelt_type = get(["seatbelt_type", "seatbelt"]);
    specs.speed_assist_system = get(["speed_assist_system"]);
    specs.child_seat_anchor_points = get(["child_seat_anchor_points", "child_seat_anchor_points_1"]);
    specs.skid_plates = get(["skid_plates", "skid_plate"]);
    specs.overspeed_warning = get(["overspeed_warning"]);
    specs.rear_middle_three_point_seatbelt = get(["rear_middle_three_point_seatbelt"]);
    specs.rear_middle_head_rest = get(["rear_middle_head_rest"]);
    specs.engine_immobiliser = get(["engine_immobiliser"]);
    specs.central_locking = get(["central_locking"]);
    specs.child_safety_lock = get(["child_safety_lock"]);
    specs.lane_departure_prevention = get(["lane_departure_prevention"]);
    specs.lane_departure_warning = get(["lane_departure_warning"]);
    specs.rear_cross_traffic_assist = get(["rear_cross_traffic_assist"]);
    specs.forward_collision_warning = get(["forward_collision_warning"]);
    specs.lane_centering_assist = get(["lane_centering_assist"]);
    specs.automatic_emergency_braking = get(["automatic_emergency_braking"]);
    specs.perimetric_alarm_system = get(["perimetric_alarm_system", "perimetric_alarm_system_1"]);
    specs.high_beam_assist = get(["high_beam_assist"]);
    specs.tyre_pressure_monitoring_system = get(["tyre_pressure_monitoring_system"]);
    specs.emergency_brake_light_flashing = get(["emergency_brake_light_flashing"]);
    specs.acoustic_vehicle_alerting_system = get(["acoustic_vehicle_alerting_system"]);
    specs.dual_tone_horn = get(["dual_tone_horn"]);
    specs.boot_open_warning = get(["boot_open_warning"]);
    specs.puncture_repair_kit = get(["puncture_repair_kit"]);
    specs.reflectors = get(["reflectors"]);
    specs.dashcam = get(["dashcam"]);
    specs.height_adjustable_seat_belt = get(["height_adjustable_seat_belt"]);
    specs.seat_belt_warning = get(["seat_belt_warning"]);
    specs.tyre_inflator = get(["tyre_inflator"]);
    specs.anti_theft_immobilisation = get(["anti_theft_immobilisation", "anti_theft_immobilisation_1"]);
    specs.tow_away_alert = get(["tow_away_alert"]);
    
    // Comfort & Convenience
    specs.air_conditioner = get(["air_conditioner"]);
    specs.air_conditioner_automatic_zones = get(["air_conditioner_automatic_zones"]);
    specs.front_ac = get(["front_ac"]);
    specs.rear_ac = get(["rear_ac_raw"]);
    specs.third_row_ac_zone = get(["third_row_ac_zone"]);
    specs.air_purifier = get(["air_purifier"]);
    specs.heater = get(["heater"]);
    specs.cruise_control = get(["cruise_control"]);
    specs.parking_assist = get(["parking_assist"]);
    specs.parking_sensors = get(["parking_sensors"]);
    specs.steering_adjustment = get(["steering_adjustment"]);
    specs.keyless_start = get(["keyless_start_button_start", "keyless_start_button_start_1"]);
    specs.fuel_filler_lid = get(["fuel_filler_lid", "fuel_filler_lid_operation", "fuel_fillers_lid"]);
    specs.electronic_parking_brake = get(["electronic_parking_brake"]);
    specs.cabin_boot_access = get(["cabin_boot_access", "cabin_boot_access_1"]);
    specs.in_car_remote = get(["in_car_remote", "in_car_remote_functions"]);
    specs.vanity_mirrors_on_sun_visors = get(["vanity_mirrors_on_sun_visors"]);
    specs.headlight_ignition_on_reminder = get(["headlight_and_ignition_on_reminder", "headlight_ignition_on_reminder"]);
    specs.creep_function = get(["creep_function"]);
    specs.power_windows = get(["power_windows", "power_windows_position"]);
    specs.rear_windshield_blind = get(["rear_windshield_blind"]);
    specs.side_window_blinds = get(["side_window_blinds"]);
    specs.door_pockets = get(["door_pockets"]);
    specs.scuff_plates = get(["scuff_plates"]);
    specs.bootlid_opener = get(["bootlid_opener"]);
    specs.rear_defogger = get(["rear_defogger"]);
    specs.rear_wiper = get(["rear_wiper"]);
    
    // Lighting & Visibility
    specs.headlights = get(["headlights_raw"]);
    specs.headlight_height_adjuster = get(["headlight_height_adjuster"]);
    specs.automatic_headlamps = get(["automatic_headlamps"]);
    specs.taillights = get(["taillights_raw"]);
    specs.daytime_running_lights = get(["daytime_running_lights", "daytime_running_lights_1"]);
    specs.fog_lights = get(["fog_lights_raw"]);
    specs.stop_lamp = get(["stop_lamp"]);
    specs.cabin_lamps_position = get(["cabin_lamps_position"]);
    specs.reading_lamp = get(["reading_lamp"]);
    specs.glovebox_lamp = get(["glovebox_lamp"]);
    specs.light_on_vanity_mirrors = get(["light_on_vanity_mirrors"]);
    specs.ambient_interior_lighting = get(["ambient_interior_lighting"]);
    specs.welcome_goodbye_animation = get(["welcome_and_goodbye_animation", "welcome_goodbye_animation"]);
    specs.charging_indicator_on_light_bar = get(["charging_indicator_on_light_bar", "charging_indicator_on_light_bar_1"]);
    specs.puddle_lamps = get(["puddle_lamps"]);
    specs.connected_led = get(["connected_led"]);
    specs.follow_me_home_headlamps = get(["follow_me_home_headlamps"]);
    
    // Mirrors & Glass
    specs.inside_rear_view_mirror = get(["inside_rear_view_mirror", "inside_rear_view_mirror_1"]);
    specs.adjustable_orvms = get(["adjustable_orvms"]);
    specs.orvm_auto_folding_function = get(["orvm_auto_folding_function"]);
    specs.turn_indicators_on_orvms = get(["turn_indicators_on_orvms"]);
    specs.anti_glare_mirrors = get(["anti_glare_mirrors"]);
    specs.interior_door_handles_finish = get(["interior_door_handles_finish"]);
    
    // Tech & Connectivity
    specs.infotainment_screen = get(["infotainment_screen_raw"]);
    specs.speakers = get(["speakers_raw"]);
    specs.subwoofer = get(["subwoofer"]);
    specs.android_auto = get(["android_auto_raw"]);
    specs.apple_carplay = get(["apple_carplay_raw"]);
    specs.am_fm_radio = get(["am_fm_radio"]);
    specs.steering_mounted_controls = get(["steering_mounted_controls", "steering_mounted_controls_1"]);
    specs.aux_compatibility = get(["aux_compatibility"]);
    specs.bluetooth = get(["bluetooth_raw"]);
    specs.voice_command = get(["voice_command"]);
    specs.voice_assistant = get(["voice_assistant"]);
    specs.wireless_charger = get(["wireless_charger_raw"]);
    
    // Connected Car Features
    specs.phone_app = get(["phone_app", "phone_app_support"]);
    specs.service_reminder_via_app = get(["service_reminder_via_app"]);
    specs.ota_updates = get(["ota_updates_raw"]);
    specs.emergency_call_button = get(["emergency_call_button"]);
    specs.find_my_car = get(["find_my_car"]);
    specs.live_traffic_updates_on_app = get(["live_traffic_updates_on_app"]);
    specs.vehicle_tracking_via_app = get(["vehicle_tracking_via_app"]);
    specs.smart_drive_information = get(["smart_drive_information"]);
    specs.driving_analytics = get(["driving_analytics"]);
    specs.breakdown_assistance_call_button = get(["breakdown_assistance_call_button"]);
    specs.location_based_services = get(["location_based_services"]);
    specs.live_location_sharing = get(["live_location_sharing"]);
    specs.digital_key = get(["digital_key"]);
    specs.remote_engine_start_stop = get(["remote_engine_start_stop", "remote_car_start_stop"]);
    specs.remote_parking_with_key = get(["remote_parking_with_key"]);
    specs.remote_ac_on_off_via_app = get(["remote_ac_on_off_via_app"]);
    specs.remote_air_purifier_operation = get(["remote_air_purifier_operation"]);
    specs.geo_fence = get(["geo_fence"]);
    specs.alexa_compatibility = get(["alexa_compatibility"]);
    specs.home_to_car_connectivity = get(["home_to_car_connectivity", "home_to_car_connectivity_1"]);
    
    // Driver Information Display
    specs.driver_information_display = get(["driver_information_display"]);
    specs.average_fuel_consumption = get(["average_fuel_consumption"]);
    specs.distance_to_empty = get(["distance_to_empty"]);
    specs.low_fuel_level_warning = get(["low_fuel_level_warning"]);
    specs.instantaneous_fuel_consumption = get(["instantaneous_fuel_consumption"]);
    specs.low_battery_warning = get(["low_battery_warning"]);
    specs.speedometer = get(["speedometer"]);
    specs.instrument_cluster_screen_type = get(["instrument_cluster_screen_type"]);
    specs.adjustable_cluster_brightness = get(["adjustable_cluster_brightness"]);
    specs.trip_meter = get(["trip_meter"]);
    specs.outside_temperature_gauge = get(["outside_temperature_gauge"]);
    specs.eco_drive_illumination = get(["eco_drive_illumination"]);
    specs.average_speed = get(["average_speed"]);
    specs.door_ajar_warning = get(["door_ajar_warning"]);
    specs.heads_up_display = get(["heads_up_display"]);
    specs.tachometer = get(["tachometer"]);
    specs.clock = get(["clock"]);
    
    // Cabin & Seating
    specs.seat_upholstery = get(["seat_upholstery_raw"]);
    specs.driver_seat_adjust = get(["driver_seat_adjust_raw"]);
    specs.passenger_seat_adjust = get(["passenger_seat_adjust_raw"]);
    specs.rear_seat_adjust = get(["rear_seat_adjust_raw"]);
    specs.ventilated_seats = get(["ventilated_seats"]);
    specs.ventilated_seat_type = get(["ventilated_seat_type"]);
    specs.headrests = get(["headrests"]);
    specs.front_seatback_pockets = get(["front_seatback_pockets"]);
    specs.driver_armrest = get(["driver_armrest"]);
    specs.driver_armrest_storage = get(["driver_armrest_storage"]);
    specs.rear_armrest = get(["rear_armrest"]);
    specs.split_rear_seat = get(["split_rear_seat"]);
    specs.folding_rear_seat = get(["folding_rear_seat"]);
    specs.rear_passenger_seat_type = get(["rear_passenger_seat_type"]);
    specs.rear_parcel_tray = get(["rear_parcel_tray"]);
    
    // Interior
    specs.interior_colors = get(["interior_colors_raw"]);
    specs.leather_wrapped_steering_wheel = get(["leather_wrapped_steering_wheel"]);
    
    // Storage & Practicality
    specs.bottle_holder_in_doors = get(["bottle_holder_in_doors"]);
    specs.cup_holders_position = get(["cup_holders_position"]);
    specs.utility_recess_on_dashboard = get(["utility_recess_on_dashboard"]);
    specs.sunglass_holder = get(["sunglass_holder"]);
    
    // Warranty & Coverage
    specs.vehicle_warranty = get(["vehicle_warranty_raw", "vehicle_warranty", "vehicle_warranty_1"]);
    specs.battery_warranty = get(["battery_warranty_raw", "battery_warranty", "battery_warranty_1"]);

    // Build output object
    const out: any = {};
    if (modelId) out.modelId = modelId;
    if (name) out.name = name;
    if (slug) out.slug = slug;
    if (price !== undefined) out.price = price;
    if (exShowroomPrice !== undefined) out.exShowroomPrice = exShowroomPrice;
    if (fuelType) out.fuelType = fuelType;
    if (transmission) out.transmission = transmission;
    if (engine) out.engine = engine;
    if (mileage !== undefined) out.mileage = mileage;
    if (seating !== undefined) out.seating = seating;
    if (colors.length) out.colors = colors;
    
    // Add specs object with only defined values
    const cleanedSpecs: any = {};
    Object.keys(specs).forEach(key => {
      if (specs[key] !== undefined) cleanedSpecs[key] = specs[key];
    });
    if (Object.keys(cleanedSpecs).length > 0) out.specs = cleanedSpecs;

    // keep any provided id if present
    if (row.id) out.id = String(row.id).trim();

    // Log for debugging (first row only)
    if (!window._normalizeDebugLogged) {
      console.log('========== CSV IMPORT DEBUG ==========');
      console.log('Available CSV columns:', Object.keys(row));
      console.log('Total columns:', Object.keys(row).length);
      console.log('');
      console.log('Looking for fuel_type. Available fuel-related columns:');
      Object.keys(row).forEach(k => {
        if (k.toLowerCase().includes('fuel') || k.toLowerCase().includes('type')) {
          console.log(`  "${k}": "${row[k]}"`);
        }
      });
      console.log('');
      console.log('Looking for ex_showroom_price. Available price-related columns:');
      Object.keys(row).forEach(k => {
        if (k.toLowerCase().includes('price') || k.toLowerCase().includes('showroom')) {
          console.log(`  "${k}": "${row[k]}"`);
        }
      });
      console.log('');
      console.log('Extracted values:');
      console.log({ modelId, name, fuelType, priceRaw, price, transmission });
      console.log('');
      console.log('Normalized output:', out);
      console.log('=====================================');
      window._normalizeDebugLogged = true;
    }

    return out;
  };

  // Helper for preview (more readable, keep a few columns)
  const normalizeRowForPreview = (row: Record<string, any>) => {
    const n = normalizeRow(row);
    return {
      id: n.id || '',
      modelId: n.modelId || row.model || row.brand || '',
      name: n.name || row.variant || row.name || '',
      price: n.price || row.price || '',
      fuelType: n.fuelType || row.fuel_type || '',
    };
  };

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold">Import Variants (CSV)</h2>
      <Card className="p-4">
        <div className="border-dashed border-2 rounded p-6 text-center" onDrop={onDrop} onDragOver={(e)=>e.preventDefault()}>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
          <div className="font-medium">Drag & drop CSV here or click to choose</div>
          <div className="text-sm text-muted-foreground mt-1">
            <div>Columns: modelId, name, slug, price, fuelType, transmission, engine, mileage, seating, colors</div>
            <div className="text-xs text-blue-600 mt-2">Note: <strong>id</strong> is optional - it will be auto-generated as <strong>modelId-name</strong> (slugified) if not provided</div>
          </div>
        </div>
        {preview?.length > 0 && (
          <div className="mt-3 overflow-auto max-h-40 border rounded p-2">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  {Object.keys(preview[0]).slice(0, 8).map((h) => <th key={h} className="pr-4">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.map((r, i) => (
                  <tr key={i}>
                    {Object.values(r).slice(0, 8).map((v, j) => <td key={j} className="pr-4">{String(v)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex gap-2 mt-3 items-center">
          <Button onClick={() => fileRef.current?.click()} variant="outline">Choose File</Button>
          <Button onClick={onUpload} disabled={uploading}>Import</Button>
          <div className="flex-1">
            <div className="h-2 bg-gray-100 rounded overflow-hidden">
              <div className="h-2 bg-blue-600" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
