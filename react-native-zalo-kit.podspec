require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-zalo-kit"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-zalo-kit
                   DESC
  s.homepage     = "https://github.com/maitrungduc1410/react-native-zalo-kit"
  # brief license entry:
  s.license      = "MIT"
  # optional - use expanded license entry instead:
  s.license    = { :type => "MIT", :file => "LICENSE" }
  s.authors      = { "Mai Trung Duc" => "maitrungduc1410@gmail.com" }
  s.platforms    = { :ios => "9.0" }
  s.source       = { :git => "https://github.com/maitrungduc1410/react-native-zalo-kit.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
  s.dependency "ZaloSDK"
end

